"use client";
/* Photos (My Pictures). App: photos. Photos come from getContent(lang).photos; empty -> sample colour cards. */
import { useState, type MouseEvent } from "react";
import type { OSApi } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { useLang, type Lang } from "@/lib/i18n";
import { useOS } from "@/components/os/OSContext";
import { iconSvg, SvgSpan } from "./shared";

const HINT_EMPTY = {
  tr: "Fotoğraf eklemek için public/ klasörüne koy ve lib/content.ts'e ekle",
  en: "To add photos, put them in the public/ folder and list them in lib/content.ts",
};

export interface PhotoItem { src: string; name: string; file: string; note: string; alt: string }

// Sample colour cards (generated SVG, 4:3) used when the photo list is empty.
const SAMPLES: [string, string, string, string][] = [
  ["Zeytinlik", "#2f4a2a", "#9fb87a", "#e9e4bf"],
  ["Konyaaltı", "#173b4a", "#5f9bab", "#efe6c4"],
  ["Araklı sisi", "#24372f", "#7f9a86", "#dfe7d6"],
  ["Gün batımı", "#4a2a24", "#c9824f", "#f2d9a0"],
  ["Gece mesaisi", "#0f1a14", "#3c6b47", "#8ccf88"],
  ["Prag taşı", "#3a3632", "#8f877b", "#dcd5c6"],
];
const SAMPLE_NAMES_EN = ["Olive grove", "Konyaalti", "Mist in Arakli", "Sunset", "Night shift", "Prague stone"];

function sampleSrc(s: [string, string, string, string], i: number): string {
  let stripes = "";
  for (let y = 0; y < 6; y++)
    stripes += '<rect x="0" y="' + (150 + y * 10) + '" width="320" height="4" fill="' + s[3] + '" opacity="' + (0.05 + y * 0.03).toFixed(2) + '"/>';
  const hills =
    '<path d="M0 170 L40 150 L80 162 L130 128 L180 150 L230 118 L280 142 L320 126 L320 240 L0 240Z" fill="' + s[1] + '" opacity=".75"/>' +
    '<path d="M0 200 L60 182 L120 196 L190 170 L250 190 L320 176 L320 240 L0 240Z" fill="' + s[0] + '"/>';
  const sun =
    '<rect x="' + (210 - i * 18) + '" y="46" width="34" height="34" fill="' + s[3] + '" opacity=".9"/>' +
    '<rect x="' + (204 - i * 18) + '" y="52" width="46" height="22" fill="' + s[3] + '" opacity=".55"/>';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" shape-rendering="crispEdges">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s[1] + '"/><stop offset="1" stop-color="' + s[3] + '"/></linearGradient></defs>' +
    '<rect width="320" height="240" fill="url(#g)"/>' + sun + stripes + hills +
    '<text x="14" y="228" font-family="Courier New,monospace" font-size="13" fill="' + s[3] + '" opacity=".85">SERDAROS 96 · ' + (i + 1) + "/6</text></svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const cache: Partial<Record<Lang, { sample: boolean; items: PhotoItem[] }>> = {};

export function getPhotos(lang: Lang): { sample: boolean; items: PhotoItem[] } {
  const hit = cache[lang];
  if (hit) return hit;
  const photos = getContent(lang).photos;
  type Loose = { src?: string; caption?: string; note?: string; alt?: string };
  const list = (Array.isArray(photos) ? (photos as Loose[]) : []).filter((p) => p && p.src);
  let out: { sample: boolean; items: PhotoItem[] };
  if (list.length) {
    out = {
      sample: false,
      items: list.map((p) => {
        const file = String(p.src).split("/").pop() || "";
        return { src: String(p.src), name: p.caption || file, file, note: p.note || p.caption || "", alt: p.alt || p.caption || file };
      }),
    };
  } else {
    const en = lang === "en";
    out = {
      sample: true,
      items: SAMPLES.map((s, i) => {
        const name = en ? SAMPLE_NAMES_EN[i] : s[0];
        const note = en ? "Sample colour card" : "Örnek renk kartı";
        return { src: sampleSrc(s, i), name, file: (en ? "sample-" : "ornek-") + (i + 1) + ".svg", note, alt: note + ": " + name };
      }),
    };
  }
  cache[lang] = out;
  return out;
}

let viewerWin: string | null = null;
export function setViewerWin(id: string | null) { viewerWin = id; }
export function getViewerWin() { return viewerWin; }

export function openViewer(os: OSApi, index: number) {
  if (viewerWin != null) {
    try { os.closeWindow(viewerWin); } catch { /* ignore */ }
    viewerWin = null;
  }
  setTimeout(() => os.openApp("photo-viewer", { index }), 0);
}

export default function Photos() {
  const os = useOS();
  const { lang, t } = useLang();
  const data = getPhotos(lang);
  const [selected, setSelected] = useState(-1);

  function onPhotoClick(e: MouseEvent<HTMLButtonElement>, i: number) {
    if (e.ctrlKey || e.metaKey) { setSelected(selected === i ? -1 : i); return; }
    setSelected(i);
    openViewer(os, i);
  }

  return (
    <div
      className="photos"
      tabIndex={-1}
      onKeyDown={(e) => { if (e.key === "Escape" && selected >= 0) { setSelected(-1); e.stopPropagation(); } }}
    >
      <div className="photos__toolbar">
        <span className="photos__location">
          <SvgSpan className="photos__location-icon" svg={iconSvg("photos")} />
          My Pictures
        </span>
        <button type="button" disabled={selected < 0} onClick={() => { if (selected >= 0) openViewer(os, selected); }}>{t("Aç", "Open")}</button>
      </div>
      <p className={"photos__hint" + (data.sample ? " photos__hint--empty" : "")}>
        {data.sample
          ? HINT_EMPTY[lang] + "."
          : t(
              "Bir fotoğrafa tıkla ve görüntüleyicide aç. Görüntüleyicide ← → ile gezinebilirsin.",
              "Click a photo to open it in the viewer. Use ← → to browse there.",
            )}
      </p>
      <div className="photos__grid" role="list" onClick={(e) => { if (e.target === e.currentTarget) setSelected(-1); }}>
        {data.items.map((p, i) => (
          <div
            key={p.src + i}
            className={"photos__card" + (data.sample ? " photos__card--sample" : "")}
            role="listitem"
            data-selected={i === selected ? "true" : "false"}
          >
            <button type="button" className="photos__photo" title={p.name + t(" — aç", " — open")} onClick={(e) => onPhotoClick(e, i)}>
              <span className="photos__thumbnail">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} loading="lazy" draggable={false} />
              </span>
              <span className="photos__name">{p.file}</span>
              <span className="photos__note">{p.note}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="photos__status">
        <span>
          {t(
            data.items.length + " fotoğraf" + (data.sample ? " (örnek)" : ""),
            data.items.length + (data.items.length === 1 ? " photo" : " photos") + (data.sample ? " (samples)" : ""),
          )}
        </span>
        <span>{selected < 0 ? "SerdarOS 96" : t("1 seçili", "1 selected")}</span>
      </div>
    </div>
  );
}
