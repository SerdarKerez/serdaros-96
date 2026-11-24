"use client";
/* Photo viewer. App: photo-viewer (args {index}). */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { AppProps } from "@/lib/os-types";
import { label } from "@/lib/labels";
import { useLang } from "@/lib/i18n";
import { getPhotos, getViewerWin, setViewerWin } from "./Photos";

export default function PhotoViewer({ winId, args, setTitle }: AppProps) {
  const { lang, t } = useLang();
  const items = getPhotos(lang).items;
  const a = (args || {}) as Record<string, unknown>;
  const [index, setIndex] = useState(() => Math.max(0, Math.min(items.length - 1, Number(a.index) | 0)));
  const rootRef = useRef<HTMLDivElement>(null);
  const sx = useRef<number | null>(null);
  const setTitleRef = useRef(setTitle);

  const p = items[index];

  useEffect(() => {
    setViewerWin(winId);
    return () => { if (getViewerWin() === winId) setViewerWin(null); };
  }, [winId]);

  useEffect(() => { setTitleRef.current(p.name + " — " + (label("photos", lang) || "Gallery")); }, [p.name, lang]);

  useEffect(() => {
    const t = setTimeout(() => { try { rootRef.current?.focus({ preventScroll: true }); } catch { /* ignore */ } }, 30);
    return () => clearTimeout(t);
  }, []);

  function go(i: number) {
    setIndex(((i % items.length) + items.length) % items.length);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(items.length - 1); }
  }

  return (
    <div className="photo-viewer" tabIndex={0} aria-label={t("Fotoğraf görüntüleyici", "Photo viewer")} ref={rootRef} onKeyDown={onKeyDown}>
      <div className="photo-viewer__caption">
        <strong>{p.file}</strong>
        <span>{p.note}</span>
      </div>
      <figure
        className="photo-viewer__stage"
        onPointerDown={(e) => { if (e.pointerType === "touch") sx.current = e.clientX; }}
        onPointerUp={(e) => {
          if (sx.current == null) return;
          const dx = e.clientX - sx.current;
          sx.current = null;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt={p.alt} draggable={false} />
      </figure>
      <div className="photo-viewer__footer">
        <div className="photo-viewer__navigation">
          <button type="button" aria-label={t("Önceki fotoğraf", "Previous photo")} disabled={items.length < 2} onClick={() => go(index - 1)}>←</button>
          <span role="status">{index + 1 + " / " + items.length}</span>
          <button type="button" aria-label={t("Sonraki fotoğraf", "Next photo")} disabled={items.length < 2} onClick={() => go(index + 1)}>→</button>
        </div>
        <span className="photo-viewer__hint">{t("← → ile gezin · dokunmatikte kaydır", "Browse with ← → · swipe on touch")}</span>
      </div>
    </div>
  );
}
