"use client";
/* SerdarOS 96 — desktop shell: wallpaper, icons, workspace (windows), notices, taskbar, popups, touch edition. */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getContent } from "@/lib/content-i18n";
import { label } from "@/lib/labels";
import { useLang } from "@/lib/i18n";
import DesktopCat from "@/components/DesktopCat";
import ContextMenu, { type MenuItem } from "./ContextMenu";
import DesktopIcons from "./DesktopIcons";
import Taskbar, { type Popup } from "./Taskbar";
import Toasts from "./Toasts";
import { TouchDock, TouchHome } from "./TouchHome";
import WindowFrame from "./WindowFrame";
import { useOS, useWM } from "./OSContext";
import { osName } from "./StartMenu";

/** Default desktop wallpaper (public/wallpaper.jpg). */
const WALLPAPER_FALLBACK = "/wallpaper.jpg";

export default function Desktop() {
  const { openApp, showDesktop } = useOS();
  const { wm, dispatch, ws, touchHeight, setMode, bootKey } = useWM();
  const touch = wm.touch;
  const { lang } = useLang();

  const [popup, setPopup] = useState<Popup>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const deskRef = useRef<HTMLElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const taskbarRef = useRef<HTMLElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);
  const clockRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<Popup>(null);
  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  const closePopups = useCallback((returnFocus?: boolean) => {
    const was = popupRef.current;
    setPopup(null);
    setMenuPos(null);
    popupRef.current = null;
    if (returnFocus && was === "start") startBtnRef.current?.focus();
    if (returnFocus && was === "cal") clockRef.current?.focus();
  }, []);
  const togglePopup = useCallback((p: "start" | "cal") => {
    const show = popupRef.current !== p;
    setMenuPos(null);
    setPopup(show ? p : null);
    popupRef.current = show ? p : null;
  }, []);
  const showContextMenu = useCallback((x: number, y: number) => {
    setPopup("menu");
    popupRef.current = "menu";
    setMenuPos({ x, y });
  }, []);

  // close popups on mode switch and restart
  const [prev, setPrev] = useState({ touch, bootKey });
  if (prev.touch !== touch || prev.bootKey !== bootKey) {
    setPrev({ touch, bootKey });
    setPopup(null);
    setMenuPos(null);
  }

  // Escape closes popups; ContextMenu / Shift+F10 open the desktop menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && popupRef.current) {
        closePopups(true);
        return;
      }
      if ((e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) && !touch) {
        const t = document.activeElement as HTMLElement | null;
        const d = deskRef.current;
        if (!t || t === document.body || t === d || t.closest?.(".desktop__icons")) {
          e.preventDefault();
          const r = t && t !== document.body && t !== d ? t.getBoundingClientRect() : { left: 120, top: 120, width: 0, height: 0 };
          showContextMenu(r.left + r.width / 2, r.top + r.height / 2);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [touch, closePopups, showContextMenu]);

  const menuItems: MenuItem[] = [
    ["New note", () => openApp("notepad", { title: "Untitled.txt", text: "" })],
    ["Blog", () => openApp("notes")],
    ["Show desktop", showDesktop],
    [label("help", lang) || "Help / Welcome.txt", () => openApp("help")],
    null,
    [touch ? "Desktop edition" : "Touch edition", () => setMode(touch ? "desktop" : "touch")],
  ];

  const wallpaperUrl = getContent(lang).owner?.wallpaper || WALLPAPER_FALLBACK;
  const style: Record<string, string> = { "--wallpaper-default": 'url("' + wallpaperUrl.replace(/"/g, "%22") + '")' };
  if (touchHeight) style["--touch-height"] = touchHeight;

  return (
    <main
      ref={deskRef}
      className={"desktop" + (touch ? " desktop--touch" : "")}
      tabIndex={-1}
      style={style as CSSProperties}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (popupRef.current) {
          const inside = [menuRef, startRef, calRef, startBtnRef, clockRef].some((r) => r.current?.contains(target));
          if (!inside) closePopups();
        }
        if (
          target === deskRef.current ||
          target === iconsRef.current ||
          target === workspaceRef.current ||
          target.classList.contains("desktop__scanlines")
        ) {
          setSelected(null);
          dispatch({ type: "blur" });
        }
      }}
      onContextMenu={(e) => {
        if (touch) return;
        const target = e.target as HTMLElement;
        if (target.closest(".desktop-window") || target.closest(".taskbar") || target.closest(".desktop__menu")) return;
        e.preventDefault();
        const ic = target.closest<HTMLElement>(".file-shortcut");
        if (ic?.dataset.id) setSelected(ic.dataset.id);
        showContextMenu(e.clientX, e.clientY);
      }}
    >
      <div className="desktop__scanlines" aria-hidden="true"></div>
      <div className="desktop__watermark" lang="en" aria-hidden="true">
        {osName(lang)}
        <small>{getContent(lang).owner?.edition || "Personal Edition"}</small>
      </div>
      <DesktopIcons selected={selected} setSelected={setSelected} iconsRef={iconsRef} />
      <div ref={workspaceRef} className="desktop__workspace">
        {wm.order.map((k) => {
          const w = wm.wins[k];
          if (!w) return null;
          const active = wm.activeId === k;
          return (
            <WindowFrame
              key={k}
              win={w}
              z={wm.stack.indexOf(k) + 1}
              active={active}
              touch={touch}
              ws={ws}
              focusSeq={active ? wm.focusSeq : 0}
            />
          );
        })}
      </div>
      <Toasts />
      <Taskbar
        popup={popup}
        togglePopup={togglePopup}
        closePopups={closePopups}
        taskbarRef={taskbarRef}
        startBtnRef={startBtnRef}
        clockRef={clockRef}
        startRef={startRef}
        calRef={calRef}
      />
      <TouchHome />
      <TouchDock />
      {popup === "menu" && menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} items={menuItems} menuRef={menuRef} onClose={closePopups} />
      )}
      <DesktopCat />
    </main>
  );
}
