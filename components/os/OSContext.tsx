"use client";
/* SerdarOS 96 — OS state: window manager (useReducer), toasts, profile, touch mode, boot readiness. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppArgs, AppDef, NotifyOptions, OSApi, Profile } from "@/lib/os-types";
import { storage } from "@/lib/storage";
import { APPS, appTitle, iconFor } from "@/components/apps/registry";
import { useLang, type Lang } from "@/lib/i18n";

export const TASKBAR_H = 48;
export const MARGIN = 8;
const NOTEPAD_FILES = ["about", "welcome", "copyright", "privacy"];
const GAME_CHILDREN = ["snake", "mines", "stack"];

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export interface WS {
  w: number;
  h: number;
}
export function getWS(): WS {
  if (typeof window === "undefined") return { w: 1024, h: 720 };
  return { w: window.innerWidth, h: Math.max(120, window.innerHeight - TASKBAR_H) };
}

/* ───── last user input (focus moves caused by the user raise windows; programmatic ones don't) ───── */
let lastInput = 0;
export function recentInput(ms = 400): boolean {
  return Date.now() - lastInput < ms;
}

/* ───── window manager state ───── */
export interface Win {
  id: string;
  appId: string;
  args: Record<string, unknown>;
  rev: number; // bumped when re-opened with different args (remounts the app)
  title: string;
  /** true once the app set its own title via setTitle (otherwise the title follows the language). */
  customTitle: boolean;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  minimized: boolean;
  maximized: boolean;
  resizable: boolean;
}

export interface WMState {
  wins: Record<string, Win>;
  order: string[]; // open order (taskbar)
  stack: string[]; // z order
  activeId: string | null;
  openCount: number;
  seq: number;
  touch: boolean;
  focusSeq: number;
}

export type WMAction =
  | { type: "open"; def: AppDef; args: AppArgs; ws: WS }
  | { type: "focus"; id: string }
  | { type: "minimize"; id: string }
  | { type: "minimizeAll" }
  | { type: "blur" }
  | { type: "toggleMax"; id: string }
  | { type: "close"; id: string }
  | { type: "closeAll" }
  | { type: "geom"; id: string; x: number; y: number; w: number; h: number }
  | { type: "title"; id: string; title: string }
  | { type: "clampAll"; ws: WS }
  | { type: "setTouch"; touch: boolean; ws: WS };

export function clampWin<T extends { x: number; y: number; w: number; h: number }>(w: T, ws: WS): T {
  const maxW = Math.max(160, ws.w - MARGIN * 2);
  const maxH = Math.max(120, ws.h - MARGIN * 2);
  const nw = Math.min(w.w, maxW);
  const nh = Math.min(w.h, maxH);
  return {
    ...w,
    w: nw,
    h: nh,
    x: clamp(w.x, MARGIN, Math.max(MARGIN, ws.w - nw - MARGIN)),
    y: clamp(w.y, MARGIN, Math.max(MARGIN, ws.h - nh - MARGIN)),
  };
}

function topVisible(s: WMState, wins = s.wins, stack = s.stack): string | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const w = wins[stack[i]];
    if (w && !w.minimized) return stack[i];
  }
  return null;
}

function setWin(s: WMState, id: string, patch: Partial<Win>): WMState {
  const w = s.wins[id];
  if (!w) return s;
  return { ...s, wins: { ...s.wins, [id]: { ...w, ...patch } } };
}

function doFocus(s: WMState, key: string): WMState {
  if (!s.wins[key]) return s;
  let wins = s.wins;
  if (s.touch) {
    // only one full-screen window visible at a time
    wins = { ...wins };
    for (const k of Object.keys(wins)) if (k !== key && !wins[k].minimized) wins[k] = { ...wins[k], minimized: true };
  }
  if (wins[key].minimized) wins = { ...wins, [key]: { ...wins[key], minimized: false } };
  return {
    ...s,
    wins,
    stack: [...s.stack.filter((k) => k !== key), key],
    activeId: key,
    focusSeq: s.focusSeq + 1,
  };
}

function minimizeAll(s: WMState): WMState {
  const wins: Record<string, Win> = {};
  for (const k of Object.keys(s.wins)) wins[k] = s.wins[k].minimized ? s.wins[k] : { ...s.wins[k], minimized: true };
  return { ...s, wins, activeId: null };
}

function winKey(s: WMState, id: string, args: AppArgs, def: AppDef): { key: string; seq: number } {
  const a = (args || {}) as Record<string, unknown>;
  if (def.singleton === false) return { key: id + "#" + (s.seq + 1), seq: s.seq + 1 };
  if (args && (a.fileId || a.key)) return { key: id + ":" + String(a.fileId || a.key), seq: s.seq };
  if (args && a.title && a.text != null) return { key: id + "#" + (s.seq + 1), seq: s.seq + 1 };
  return { key: id, seq: s.seq };
}

function sameArgs(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a || {}) === JSON.stringify(b || {});
  } catch {
    return true;
  }
}

export function wmReducer(s: WMState, a: WMAction): WMState {
  switch (a.type) {
    case "open": {
      const { def, args, ws } = a;
      const { key, seq } = winKey(s, def.id, args, def);
      const ex = s.wins[key];
      if (ex) {
        let next = s;
        if (args && !sameArgs(args, ex.args)) next = setWin(s, key, { args: args as Record<string, unknown>, rev: ex.rev + 1 });
        return doFocus({ ...next, seq }, key);
      }
      const w = Math.min(def.width || 560, ws.w - MARGIN * 2);
      const h = Math.min(def.height || 590, ws.h - MARGIN * 2);
      const offset = (s.openCount % 5) * 24;
      const win: Win = clampWin(
        {
          id: key,
          appId: def.id,
          args: (args || {}) as Record<string, unknown>,
          rev: 0,
          title: def.title || def.id,
          customTitle: false,
          icon: def.icon || iconFor(def.id),
          w,
          h,
          x: Math.round((ws.w - w) / 2) + offset - 24,
          y: Math.round((ws.h - h) / 2) + offset - 24,
          minW: def.minWidth || 320,
          minH: def.minHeight || 300,
          minimized: false,
          maximized: false,
          resizable: def.resizable !== false,
        },
        ws,
      );
      const next: WMState = {
        ...s,
        seq,
        openCount: s.openCount + 1,
        wins: { ...s.wins, [key]: win },
        order: [...s.order, key],
        stack: [...s.stack, key],
      };
      return doFocus(next, key);
    }
    case "focus":
      return doFocus(s, a.id);
    case "minimize": {
      const next = setWin(s, a.id, { minimized: true });
      if (next === s) return s;
      if (next.activeId === a.id) return { ...next, activeId: s.touch ? null : topVisible(next) };
      return next;
    }
    case "minimizeAll":
      return minimizeAll(s);
    case "blur":
      return s.activeId === null ? s : { ...s, activeId: null };
    case "toggleMax": {
      const w = s.wins[a.id];
      if (!w || !w.resizable) return s;
      return setWin(s, a.id, { maximized: !w.maximized });
    }
    case "close": {
      if (!s.wins[a.id]) return s;
      const wins = { ...s.wins };
      delete wins[a.id];
      const stack = s.stack.filter((k) => k !== a.id);
      const next: WMState = { ...s, wins, stack, order: s.order.filter((k) => k !== a.id) };
      if (s.activeId === a.id) next.activeId = s.touch ? null : topVisible(next);
      return next;
    }
    case "closeAll":
      return { ...s, wins: {}, order: [], stack: [], activeId: null, openCount: 0 };
    case "geom":
      return setWin(s, a.id, { x: a.x, y: a.y, w: a.w, h: a.h });
    case "title":
      return s.wins[a.id]?.title === a.title && s.wins[a.id]?.customTitle ? s : setWin(s, a.id, { title: a.title, customTitle: true });
    case "clampAll": {
      const wins: Record<string, Win> = {};
      for (const k of Object.keys(s.wins)) {
        const c = clampWin(s.wins[k], a.ws);
        const o = s.wins[k];
        wins[k] = c.x === o.x && c.y === o.y && c.w === o.w && c.h === o.h ? o : c;
      }
      return { ...s, wins };
    }
    case "setTouch": {
      if (a.touch === s.touch) return s;
      const base = { ...s, touch: a.touch };
      if (a.touch) {
        const keep = s.activeId && s.wins[s.activeId] && !s.wins[s.activeId].minimized ? s.activeId : null;
        return keep ? doFocus(base, keep) : minimizeAll(base);
      }
      return wmReducer(base, { type: "clampAll", ws: a.ws });
    }
  }
}

/** Title to show for a window in the current language. */
export function winTitle(w: Win, lang: Lang): string {
  return w.customTitle ? w.title : appTitle(w.appId, lang);
}

/* ───── profile / touch helpers ───── */
function readProfile(): Profile {
  const p = storage.get<unknown>("profile", null);
  if (!p) return { name: "Guest", avatar: null, saved: false };
  if (typeof p === "string") return { name: p, avatar: null, saved: true };
  const o = p as Record<string, string | undefined>;
  return { name: o.name || o.displayName || "Guest", avatar: o.avatar || o.avatarId || null, saved: true };
}

export function detectTouch(): boolean {
  const forced = storage.get<string | null>("mode", null);
  if (forced === "touch") return true;
  if (forced === "desktop") return false;
  let coarse = false;
  try {
    coarse = window.matchMedia("(pointer: coarse) and (any-hover: none)").matches;
  } catch {
    /* noop */
  }
  return coarse || window.innerWidth < 700;
}

/** Visitors can no longer pick their own background (it's set in /admin); drop keys saved by older versions. */
function clearLegacyWallpaper(): void {
  storage.set("wallpaper", null);
  storage.set("wallpaper-src", null);
}

export interface Toast {
  id: number;
  text: string;
  opts: NotifyOptions;
}

/* ───── contexts ───── */
export interface WMApi {
  wm: WMState;
  dispatch: Dispatch<WMAction>;
  ws: WS;
  touchHeight: string | null;
  toasts: Toast[];
  removeToast: (id: number) => void;
  setMode: (m: "touch" | "desktop") => void;
  goBack: (winId: string) => void;
  showHome: () => void;
  bootKey: number;
  finishBoot: () => void;
}

const OSCtx = createContext<OSApi | null>(null);
const WMCtx = createContext<WMApi | null>(null);

export function useOS(): OSApi {
  const v = useContext(OSCtx);
  if (!v) throw new Error("useOS() must be used inside <OSProvider>");
  return v;
}

export function useWM(): WMApi {
  const v = useContext(WMCtx);
  if (!v) throw new Error("useWM() must be used inside <OSProvider>");
  return v;
}

export function useIsActiveWindow(winId: string): boolean {
  const { wm } = useWM();
  const w = wm.wins[winId];
  return wm.activeId === winId && !!w && !w.minimized;
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [wm, dispatch] = useReducer(wmReducer, undefined, (): WMState => ({
    wins: {},
    order: [],
    stack: [],
    activeId: null,
    openCount: 0,
    seq: 0,
    touch: detectTouch(),
    focusSeq: 0,
  }));
  const { t } = useLang();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const [ws, setWs] = useState<WS>(getWS);
  const [touchHeight, setTouchHeight] = useState<string | null>(null);
  useEffect(clearLegacyWallpaper, []);
  const [profile, setProfileState] = useState<Profile>(readProfile);
  const [notesVersion, setNotesVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const [bootKey, setBootKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);
  const afterBoot = useRef<(() => void) | null>(null);
  const wmRef = useRef(wm);
  useEffect(() => {
    wmRef.current = wm;
  });

  /* notices */
  const notify = useCallback((text: string, opts?: NotifyOptions) => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t, { id, text: String(text), opts: opts || {} }].slice(-3));
  }, []);
  const removeToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* restart / boot */
  const firstVisit = useCallback(() => {
    if (!storage.get("profile", null) && APPS.profile) dispatch({ type: "open", def: APPS.profile, args: undefined, ws: getWS() });
  }, []);
  const restart = useCallback(() => {
    dispatch({ type: "closeAll" });
    setReady(false);
    setBootKey((k) => k + 1);
    afterBoot.current = firstVisit;
  }, [firstVisit]);
  const finishBoot = useCallback(() => {
    setReady(true);
    const cb = afterBoot.current;
    afterBoot.current = null;
    if (cb) cb();
  }, []);

  /* windows */
  const openApp = useCallback(
    (id: string, args?: AppArgs) => {
      if (id === "restart") {
        restart();
        return;
      }
      let appId = id;
      let a = args;
      if (NOTEPAD_FILES.includes(id) && !APPS[id]) {
        appId = "notepad";
        a = { fileId: id, ...(args || {}) };
      } else if (id === "help" && !APPS.help) {
        appId = "notepad";
        a = { fileId: "welcome" };
      }
      const def = APPS[appId];
      if (!def) {
        notify(tRef.current("Yakında...", "Coming soon..."));
        return;
      }
      dispatch({ type: "open", def, args: a, ws: getWS() });
    },
    [notify, restart],
  );
  const closeWindow = useCallback((winId: string) => dispatch({ type: "close", id: winId }), []);
  const focusWindow = useCallback((winId: string) => dispatch({ type: "focus", id: winId }), []);
  const showDesktop = useCallback(() => dispatch({ type: "minimizeAll" }), []);
  const showHome = showDesktop;

  const goBack = useCallback(
    (winId: string) => {
      const w = wmRef.current.wins[winId];
      if (!w) return;
      let parent: string | null = null;
      if (GAME_CHILDREN.includes(w.appId)) parent = "games";
      else if (w.appId === "notepad") parent = (w.args.parent as string) || null;
      else {
        const def = APPS[w.appId] as AppDef & { parent?: string };
        if (def?.parent) parent = def.parent;
      }
      dispatch({ type: "close", id: winId });
      if (parent && APPS[parent]) openApp(parent);
      else dispatch({ type: "minimizeAll" });
    },
    [openApp],
  );

  /* profile */
  const setProfile = useCallback((p: { name: string; avatar: string | null } | null) => {
    storage.set("profile", p ? { name: p.name, avatar: p.avatar } : null);
    setProfileState(readProfile());
  }, []);
  const bumpNotes = useCallback(() => setNotesVersion((v) => v + 1), []);

  /* touch mode */
  const setMode = useCallback((m: "touch" | "desktop") => {
    storage.set("mode", m);
    dispatch({ type: "setTouch", touch: detectTouch(), ws: getWS() });
  }, []);

  /* document / window listeners */
  useEffect(() => {
    const mark = () => {
      lastInput = Date.now();
    };
    document.addEventListener("pointerdown", mark, true);
    document.addEventListener("keydown", mark, true);
    let rt: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const t = detectTouch();
        const size = getWS();
        dispatch({ type: "setTouch", touch: t, ws: size });
        if (!t) dispatch({ type: "clampAll", ws: size });
        setWs(size);
        if (window.visualViewport) setTouchHeight(window.visualViewport.height + "px");
      }, 60);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "serdaros-profile") setProfileState(readProfile());
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("pointerdown", mark, true);
      document.removeEventListener("keydown", mark, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("storage", onStorage);
      clearTimeout(rt);
    };
  }, []);

  /* body classes (CSS + cat hooks) */
  useEffect(() => {
    document.body.classList.toggle("os-ready", ready);
  }, [ready]);
  useEffect(() => {
    document.body.classList.toggle("os-touch", wm.touch);
  }, [wm.touch]);
  useEffect(
    () => () => {
      document.body.classList.remove("os-ready", "os-touch");
    },
    [],
  );

  /* first visit: open the profile app underneath the boot screen */
  useEffect(() => {
    firstVisit();
  }, [firstVisit]);

  const touch = wm.touch;
  const api = useMemo<OSApi>(
    () => ({
      openApp,
      closeWindow,
      focusWindow,
      notify,
      restart,
      showDesktop,
      isTouch: touch,
      ready,
      profile,
      setProfile,
      notesVersion,
      bumpNotes,
    }),
    [openApp, closeWindow, focusWindow, notify, restart, showDesktop, touch, ready, profile, setProfile, notesVersion, bumpNotes],
  );

  const wmApi = useMemo<WMApi>(
    () => ({
      wm,
      dispatch,
      ws,
      touchHeight,
      toasts,
      removeToast,
      setMode,
      goBack,
      showHome,
      bootKey,
      finishBoot,
    }),
    [wm, ws, touchHeight, toasts, removeToast, setMode, goBack, showHome, bootKey, finishBoot],
  );

  return (
    <OSCtx.Provider value={api}>
      <WMCtx.Provider value={wmApi}>{children}</WMCtx.Provider>
    </OSCtx.Provider>
  );
}
