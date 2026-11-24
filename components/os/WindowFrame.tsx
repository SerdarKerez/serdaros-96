"use client";
/* SerdarOS 96 — a desktop window: titlebar drag, 8-way resize, maximize, keyboard move/resize, error boundary. */
import { Component, memo, useCallback, useEffect, useLayoutEffect, useRef, type ErrorInfo, type ReactNode } from "react";
import { APPS } from "@/components/apps/registry";
import { ICONS } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import { MARGIN, clamp, clampWin, getWS, recentInput, useWM, winTitle, type Win, type WS } from "./OSContext";

const DIRS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
type Dir = (typeof DIRS)[number];

function icon(key: string): string {
  return ICONS[key] || ICONS.text || "";
}

class AppBoundary extends Component<{ className: string; appId: string; errorText: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[SerdarOS] render failed for", this.props.appId, err, info.componentStack);
  }
  render() {
    const { className, children, errorText } = this.props;
    if (this.state.failed) return <div className={className + " desktop-window__body--error"}>{errorText}</div>;
    return <div className={className}>{children}</div>;
  }
}

interface Props {
  win: Win;
  z: number;
  active: boolean;
  touch: boolean;
  ws: WS;
  focusSeq: number; // non-zero only for the active window; changes on every focus request
}

function WindowFrameImpl({ win, z, active, touch, ws, focusSeq }: Props) {
  const { dispatch, goBack } = useWM();
  const { lang, t } = useLang();
  const title = winTitle(win, lang);
  const ref = useRef<HTMLElement>(null);
  const key = win.id;
  const def = APPS[win.appId];
  const live = useRef(win);
  const activeRef = useRef(active);
  const touchRef = useRef(touch);
  useLayoutEffect(() => {
    live.current = win;
    activeRef.current = active;
    touchRef.current = touch;
  });

  const setTitle = useCallback((t: string) => dispatch({ type: "title", id: key, title: String(t) }), [dispatch, key]);
  const close = useCallback(() => dispatch({ type: "close", id: key }), [dispatch, key]);

  // bring keyboard focus into the window when it is focused (unless something inside already has it)
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) {
      try {
        el.focus({ preventScroll: true });
      } catch {
        /* noop */
      }
    }
  }, [active, focusSeq]);

  const applyStyle = (g: { x: number; y: number; w: number; h: number }) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("left", g.x + "px");
    el.style.setProperty("top", g.y + "px");
    el.style.setProperty("width", g.w + "px");
    el.style.setProperty("height", g.h + "px");
  };
  const commit = (g: { x: number; y: number; w: number; h: number }) =>
    dispatch({ type: "geom", id: key, x: g.x, y: g.y, w: g.w, h: g.h });

  /* drag */
  const drag = useRef<{ px: number; py: number; x: number; y: number; id: number; g: Win } | null>(null);
  const onBarDown = (e: React.PointerEvent<HTMLElement>) => {
    const w = live.current;
    if (touch || w.maximized || e.button !== 0 || (e.target as Element).closest("button")) return;
    drag.current = { px: e.clientX, py: e.clientY, x: w.x, y: w.y, id: e.pointerId, g: w };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    ref.current?.classList.add("is-dragging");
  };
  const onBarMove = (e: React.PointerEvent<HTMLElement>) => {
    const st = drag.current;
    if (!st || e.pointerId !== st.id) return;
    st.g = clampWin({ ...st.g, x: st.x + e.clientX - st.px, y: st.y + e.clientY - st.py }, getWS());
    applyStyle(st.g);
  };
  const onBarEnd = (e: React.PointerEvent<HTMLElement>) => {
    const st = drag.current;
    if (!st || e.pointerId !== st.id) return;
    drag.current = null;
    ref.current?.classList.remove("is-dragging");
    commit(st.g);
  };

  /* resize */
  const rs = useRef<{ dir: Dir; px: number; py: number; x: number; y: number; w: number; h: number; id: number; g: Win } | null>(null);
  const onResizeDown = (dir: Dir) => (e: React.PointerEvent<HTMLElement>) => {
    const w = live.current;
    if (touch || w.maximized || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    rs.current = { dir, px: e.clientX, py: e.clientY, x: w.x, y: w.y, w: w.w, h: w.h, id: e.pointerId, g: w };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    ref.current?.classList.add("is-resizing");
  };
  const onResizeMove = (e: React.PointerEvent<HTMLElement>) => {
    const st = rs.current;
    if (!st || e.pointerId !== st.id) return;
    const w = live.current;
    const size = getWS();
    const dx = e.clientX - st.px;
    const dy = e.clientY - st.py;
    let nx = st.x,
      ny = st.y,
      nw = st.w,
      nh = st.h;
    if (st.dir.includes("e")) nw = clamp(st.w + dx, w.minW, size.w - MARGIN - st.x);
    if (st.dir.includes("s")) nh = clamp(st.h + dy, w.minH, size.h - MARGIN - st.y);
    if (st.dir.includes("w")) {
      nw = clamp(st.w - dx, w.minW, st.x + st.w - MARGIN);
      nx = st.x + st.w - nw;
    }
    if (st.dir.includes("n")) {
      nh = clamp(st.h - dy, w.minH, st.y + st.h - MARGIN);
      ny = st.y + st.h - nh;
    }
    st.g = { ...st.g, x: nx, y: ny, w: nw, h: nh };
    applyStyle(st.g);
  };
  const onResizeEnd = (e: React.PointerEvent<HTMLElement>) => {
    const st = rs.current;
    if (!st || e.pointerId !== st.id) return;
    rs.current = null;
    ref.current?.classList.remove("is-resizing");
    const g = clampWin(st.g, getWS());
    applyStyle(g);
    commit(g);
  };
  const onResizeKey = (e: React.KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 1 : 10;
    let dw = 0,
      dh = 0;
    if (e.key === "ArrowLeft") dw = -step;
    else if (e.key === "ArrowRight") dw = step;
    else if (e.key === "ArrowUp") dh = -step;
    else if (e.key === "ArrowDown") dh = step;
    else return;
    e.preventDefault();
    const w = live.current;
    const size = getWS();
    commit({
      x: w.x,
      y: w.y,
      w: clamp(w.w + dw, w.minW, size.w - MARGIN - w.x),
      h: clamp(w.h + dh, w.minH, size.h - MARGIN - w.y),
    });
  };

  const onTitleKey = (e: React.KeyboardEvent<HTMLElement>) => {
    const w = live.current;
    if (touch || w.maximized) return;
    const step = e.shiftKey ? 1 : 10;
    let dx = 0,
      dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    commit(clampWin({ x: w.x + dx, y: w.y + dy, w: w.w, h: w.h }, getWS()));
  };

  const geom = win.maximized ? { left: 0, top: 0, width: ws.w, height: ws.h } : { left: win.x, top: win.y, width: win.w, height: win.h };
  const Body = def?.Component;

  return (
    <section
      ref={ref}
      className="desktop-window"
      role="dialog"
      aria-label={title}
      data-app={win.appId}
      data-win-id={key}
      data-active={active ? "true" : "false"}
      data-maximized={win.maximized ? "true" : "false"}
      tabIndex={-1}
      hidden={win.minimized}
      style={{ ...geom, zIndex: z }}
      onPointerDownCapture={() => {
        if (!activeRef.current) dispatch({ type: "focus", id: key });
      }}
      onFocus={() => {
        if (!activeRef.current && recentInput()) dispatch({ type: "focus", id: key });
      }}
    >
      <header
        className="desktop-window__titlebar"
        onPointerDown={onBarDown}
        onPointerMove={onBarMove}
        onPointerUp={onBarEnd}
        onPointerCancel={onBarEnd}
        onDoubleClick={(e) => {
          if (touchRef.current || (e.target as Element).closest("button") || !win.resizable) return;
          dispatch({ type: "toggleMax", id: key });
        }}
      >
        <button
          type="button"
          className="desktop-window__back"
          aria-label="Back"
          onClick={(e) => {
            e.stopPropagation();
            goBack(key);
          }}
        >
          &larr;
        </button>
        <div className="desktop-window__title" tabIndex={0} onKeyDown={onTitleKey}>
          <span className="desktop-window__icon" style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: icon(win.icon) }} />
          <h2>{title}</h2>
        </div>
        <div className="desktop-window__controls">
          <button
            type="button"
            className="desktop-window__minimize"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "minimize", id: key });
            }}
          >
            <span className="window-symbol window-symbol--minimize"></span>
          </button>
          <button
            type="button"
            className="desktop-window__maximize"
            aria-label={win.maximized ? "Restore" : "Maximize"}
            disabled={!win.resizable}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "toggleMax", id: key });
            }}
          >
            <span className={"window-symbol window-symbol--" + (win.maximized ? "restore" : "maximize")}></span>
          </button>
          <button
            type="button"
            className="desktop-window__close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <span className="window-symbol window-symbol--close">×</span>
          </button>
        </div>
      </header>
      <AppBoundary key={win.rev} className={"desktop-window__body app-" + win.appId}
        appId={win.appId}
        errorText={t("Bu uygulama açılırken bir hata oluştu.", "Something went wrong while opening this app.")}
      >
        {Body ? <Body winId={key} args={win.args} setTitle={setTitle} close={close} /> : null}
      </AppBoundary>
      {win.resizable &&
        DIRS.map((d) => {
          const common = {
            className: "desktop-window__resize desktop-window__resize--" + d,
            "data-dir": d,
            onPointerDown: onResizeDown(d),
            onPointerMove: onResizeMove,
            onPointerUp: onResizeEnd,
            onPointerCancel: onResizeEnd,
          };
          return d === "se" ? (
            <button key={d} type="button" aria-label="Resize window" tabIndex={0} onKeyDown={onResizeKey} {...common} />
          ) : (
            <div key={d} {...common} />
          );
        })}
    </section>
  );
}

export const WindowFrame = memo(WindowFrameImpl);
export default WindowFrame;
