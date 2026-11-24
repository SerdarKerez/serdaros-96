"use client";
/* SerdarOS 96 — shared helpers for calculator and games. Owner: builder-games. */
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useIsActiveWindow } from "@/components/os/OSContext";
import { getContent } from "@/lib/content-i18n";
import { useLang } from "@/lib/i18n";

export function prefersReduced(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Keyboard input goes to the app only while its window is the active one and its root is visible.
 * Typing in an input/textarea/select outside the app is ignored.
 */
export function useGameKeys(
  winId: string,
  rootRef: RefObject<HTMLElement | null>,
  handler: (e: KeyboardEvent) => void,
  opts: { allowModifiers?: boolean } = {},
): void {
  const active = useIsActiveWindow(winId);
  const activeRef = useRef(active);
  const handlerRef = useRef(handler);
  const allowMods = !!opts.allowModifiers;
  useEffect(() => {
    activeRef.current = active;
    handlerRef.current = handler;
  });
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const root = rootRef.current;
      if (!activeRef.current || !root || !root.isConnected || !root.getClientRects().length) return;
      const t = e.target as HTMLElement | null;
      if (t && t !== document.body && !root.contains(t) && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t && t.isContentEditable && !root.contains(t)) return;
      if (!allowMods && (e.ctrlKey || e.metaKey || e.altKey)) return;
      handlerRef.current(e);
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [rootRef, allowMods]);
}

/** Calls fn when the tab is hidden or the browser window loses focus. Returns cleanup. */
export function onAway(fn: () => void): () => void {
  function vis() {
    if (document.hidden) fn();
  }
  document.addEventListener("visibilitychange", vis);
  window.addEventListener("blur", fn);
  return () => {
    document.removeEventListener("visibilitychange", vis);
    window.removeEventListener("blur", fn);
  };
}

export function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const c = canvas.getContext("2d");
  if (!c) return null;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.imageSmoothingEnabled = false;
  return c;
}

/** Tiny pixel-art helper: rows of chars -> svg rects (static strings, rendered via dangerouslySetInnerHTML). */
export function pixelSvg(rows: string[], colors: Record<string, string>, size: number, extra = ""): string {
  let s = `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">`;
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const c = colors[r[x]];
      if (c) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
    }
  });
  return s + extra + "</svg>";
}

export function GameShell({ rootRef, variant, title, sub, right, contentClass, children }: {
  rootRef: RefObject<HTMLDivElement | null>;
  variant: string;
  title: string;
  sub: string;
  right?: ReactNode;
  contentClass?: string;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const osName = getContent(lang).owner?.os || "SerdarOS 96";
  return (
    <div className={"gm gm--" + variant} ref={rootRef}>
      <div className="gm__toolbar">
        <span>
          {title} <small>{sub}</small>
        </span>
        {right}
      </div>
      <div className={"gm__content" + (contentClass ? " " + contentClass : "")}>{children}</div>
      <div className="gm__footer">{osName} Games</div>
    </div>
  );
}
