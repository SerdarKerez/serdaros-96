"use client";
/* SerdarOS 96 — draggable desktop shortcuts (positions saved, arrow-key navigation, Ctrl/Alt+arrows move). */
import { useRef, useState } from "react";
import { getContent } from "@/lib/content-i18n";
import { useLang, type Lang } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { ICONS } from "@/components/icons";
import { metaFor } from "@/components/apps/registry";
import { clamp, getWS, useOS, useWM, type WS } from "./OSContext";

const CELL = { w: 94, h: 88, gapX: 10, gapY: 7, x0: 10, y0: 12 };
type Pos = { x: number; y: number };

function gridRows(ws: WS) {
  return Math.max(1, Math.floor((ws.h - 24 + CELL.gapY) / (CELL.h + CELL.gapY)));
}
function cellPos(i: number, ws: WS): Pos {
  const rows = gridRows(ws);
  const col = Math.floor(i / rows);
  const row = i % rows;
  return { x: CELL.x0 + col * (CELL.w + CELL.gapX), y: CELL.y0 + row * (CELL.h + CELL.gapY) };
}
function clampIcon(p: Pos, ws: WS = getWS()): Pos {
  return { x: clamp(p.x, 0, Math.max(0, ws.w - CELL.w)), y: clamp(p.y, 0, Math.max(0, ws.h - CELL.h)) };
}
function ids(lang: Lang): string[] {
  return getContent(lang).desktopIcons || [];
}
function layoutIcons(ws: WS, lang: Lang): Record<string, Pos> {
  const saved = storage.get<Record<string, Pos>>("icons", {}) || {};
  const used: Pos[] = [];
  ids(lang).forEach((id) => {
    if (saved[id]) used.push(clampIcon(saved[id], ws));
  });
  let cell = 0;
  const out: Record<string, Pos> = {};
  ids(lang).forEach((id) => {
    let p: Pos;
    if (saved[id]) p = clampIcon(saved[id], ws);
    else {
      do {
        p = cellPos(cell++, ws);
      } while (cell < 400 && used.some((u) => Math.abs(u.x - p.x) < 50 && Math.abs(u.y - p.y) < 50));
      used.push(p);
    }
    out[id] = p;
  });
  return out;
}
function saveIconPos(id: string, p: Pos) {
  const saved = storage.get<Record<string, Pos>>("icons", {}) || {};
  saved[id] = { x: Math.round(p.x), y: Math.round(p.y) };
  storage.set("icons", saved);
}

export default function DesktopIcons({
  selected,
  setSelected,
  iconsRef,
}: {
  selected: string | null;
  setSelected: (id: string | null) => void;
  iconsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { openApp } = useOS();
  const { wm, ws, dispatch } = useWM();
  const touch = wm.touch;
  const { lang } = useLang();
  const [pos, setPos] = useState<Record<string, Pos>>(() => layoutIcons(getWS(), lang));
  const btns = useRef<Record<string, HTMLButtonElement | null>>({});
  const drag = useRef<{ id: string; px: number; py: number; x: number; y: number; pid: number; drag: boolean; type: string; p: Pos } | null>(null);

  // re-layout when the workspace changes size or we return to the desktop edition
  const [prev, setPrev] = useState({ ws, touch, lang });
  if (prev.ws !== ws || prev.touch !== touch || prev.lang !== lang) {
    setPrev({ ws, touch, lang });
    if (!touch) setPos(layoutIcons(ws, lang));
  }

  const move = (id: string, p: Pos) => {
    setPos((o) => ({ ...o, [id]: p }));
    saveIconPos(id, p);
  };

  const focusNeighbour = (id: string, key: string) => {
    const a = pos[id];
    if (!a) return;
    let best: string | null = null;
    let bestD = Infinity;
    ids(lang).forEach((o) => {
      if (o === id || !pos[o]) return;
      const dx = pos[o].x - a.x;
      const dy = pos[o].y - a.y;
      const ok = key === "ArrowLeft" ? dx < -20 : key === "ArrowRight" ? dx > 20 : key === "ArrowUp" ? dy < -20 : dy > 20;
      if (!ok) return;
      const horiz = key === "ArrowLeft" || key === "ArrowRight";
      const d = horiz ? Math.abs(dx) + Math.abs(dy) * 3 : Math.abs(dy) + Math.abs(dx) * 3;
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    });
    if (best) {
      btns.current[best]?.focus();
      setSelected(best);
    }
  };

  return (
    <div ref={iconsRef} className="desktop__icons" role="group" aria-label="Desktop">
      {ids(lang).map((id) => {
        const m = metaFor(id, lang);
        const p = pos[id] || { x: 0, y: 0 };
        return (
          <button
            key={id}
            ref={(el) => {
              btns.current[id] = el;
            }}
            type="button"
            className="file-shortcut"
            data-id={id}
            aria-pressed={selected === id ? "true" : "false"}
            title={m.title}
            style={{ left: p.x, top: p.y }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              setSelected(id);
              dispatch({ type: "blur" });
              drag.current = { id, px: e.clientX, py: e.clientY, x: p.x, y: p.y, pid: e.pointerId, drag: false, type: e.pointerType, p };
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                /* noop */
              }
            }}
            onPointerMove={(e) => {
              const st = drag.current;
              if (!st || e.pointerId !== st.pid) return;
              const dx = e.clientX - st.px;
              const dy = e.clientY - st.py;
              if (!st.drag && Math.abs(dx) + Math.abs(dy) < 5) return;
              st.drag = true;
              const b = e.currentTarget;
              b.dataset.dragging = "true";
              st.p = clampIcon({ x: st.x + dx, y: st.y + dy });
              b.style.left = st.p.x + "px";
              b.style.top = st.p.y + "px";
            }}
            onPointerUp={(e) => {
              const st = drag.current;
              if (!st || e.pointerId !== st.pid) return;
              drag.current = null;
              delete e.currentTarget.dataset.dragging;
              if (st.drag) move(id, st.p);
              else if (st.type === "touch") openApp(id);
            }}
            onPointerCancel={(e) => {
              const st = drag.current;
              if (!st || e.pointerId !== st.pid) return;
              drag.current = null;
              delete e.currentTarget.dataset.dragging;
              if (st.drag) move(id, st.p);
            }}
            onDoubleClick={() => openApp(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                openApp(id);
                return;
              }
              if (e.key.indexOf("Arrow") !== 0) return;
              e.preventDefault();
              if (!(e.ctrlKey || e.altKey || e.metaKey)) {
                focusNeighbour(id, e.key);
                return;
              }
              // Ctrl/Alt + arrows move the icon (Shift = 1px)
              const step = e.shiftKey ? 1 : 10;
              let dx = 0,
                dy = 0;
              if (e.key === "ArrowLeft") dx = -step;
              else if (e.key === "ArrowRight") dx = step;
              else if (e.key === "ArrowUp") dy = -step;
              else dy = step;
              move(id, clampIcon({ x: p.x + dx, y: p.y + dy }));
            }}
            onFocus={() => setSelected(id)}
          >
            <span className="file-icon" dangerouslySetInnerHTML={{ __html: ICONS[m.icon] || ICONS.text || "" }} />
            <span>{m.title}</span>
          </button>
        );
      })}
    </div>
  );
}
