"use client";
/* SerdarOS 96 — taskbar: start button, task buttons, show desktop, tray clock, start/calendar panels. */
import { useEffect, useState, type RefObject } from "react";
import { ICONS, RawSvg } from "@/components/icons";
import Calendar from "./Calendar";
import StartMenu, { avatarIcon } from "./StartMenu";
import { useLang } from "@/lib/i18n";
import { useOS, useWM, winTitle } from "./OSContext";

export type Popup = "start" | "cal" | "menu" | null;

function clockNow() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

/** HH:MM clock (+ long date), refreshed every second. */
export function useClock() {
  const [c, setC] = useState(clockNow);
  useEffect(() => {
    const iv = setInterval(() => {
      const n = clockNow();
      setC((o) => (o.time === n.time && o.date === n.date ? o : n));
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return c;
}

/** Compact TR / EN switch (taskbar tray, touch header). Shows the current language; click toggles. */
export function LangToggle({ className }: { className?: string }) {
  const { lang, toggle, t } = useLang();
  return (
    <button
      type="button"
      className={"lang-toggle" + (className ? " " + className : "")}
      data-lang={lang}
      aria-label={t("Dili değiştir", "Change language")}
      title={t("Dili değiştir: English", "Change language: Türkçe")}
      onClick={toggle}
    >
      {lang === "en" ? "EN" : "TR"}
    </button>
  );
}

export default function Taskbar({
  popup,
  togglePopup,
  closePopups,
  taskbarRef,
  startBtnRef,
  clockRef,
  startRef,
  calRef,
}: {
  popup: Popup;
  togglePopup: (p: "start" | "cal") => void;
  closePopups: (returnFocus?: boolean) => void;
  taskbarRef: RefObject<HTMLElement | null>;
  startBtnRef: RefObject<HTMLButtonElement | null>;
  clockRef: RefObject<HTMLButtonElement | null>;
  startRef: RefObject<HTMLDivElement | null>;
  calRef: RefObject<HTMLDivElement | null>;
}) {
  const { wm, dispatch } = useWM();
  const { profile, showDesktop } = useOS();
  const clock = useClock();
  const { lang } = useLang();

  return (
    <footer
      ref={taskbarRef}
      className="taskbar"
      onBlur={(e) => {
        const rt = e.relatedTarget as Node | null;
        if (popup && popup !== "menu" && rt && !taskbarRef.current?.contains(rt)) closePopups();
      }}
    >
      <button
        ref={startBtnRef}
        type="button"
        className="taskbar__start"
        aria-haspopup="menu"
        aria-expanded={popup === "start" ? "true" : "false"}
        onClick={() => togglePopup("start")}
      >
        <span className="taskbar-icon" dangerouslySetInnerHTML={{ __html: avatarIcon(profile) }} />
        <span>start</span>
      </button>
      <span className="taskbar__divider" aria-hidden="true"></span>
      <div className="taskbar__tasks" role="toolbar" aria-label="Open windows">
        {wm.order.map((k) => {
          const w = wm.wins[k];
          if (!w) return null;
          const act = wm.activeId === k;
          const title = winTitle(w, lang);
          return (
            <button
              key={k}
              type="button"
              className="taskbar__task"
              title={title}
              aria-pressed={act && !w.minimized ? "true" : "false"}
              onClick={() => {
                if (act && !w.minimized) dispatch({ type: "minimize", id: k });
                else dispatch({ type: "focus", id: k });
              }}
            >
              <span className="taskbar-icon" dangerouslySetInnerHTML={{ __html: ICONS[w.icon] || ICONS.text || "" }} />
              <span>{title}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="taskbar__show-desktop" title="Show desktop" aria-label="Show desktop" onClick={showDesktop}>
        <RawSvg svg={ICONS.desktop || ""} />
      </button>
      <div className="taskbar__tray">
        <span className="taskbar__status-light" title="Online" aria-hidden="true"></span>
        <LangToggle className="taskbar__lang" />
        <button
          ref={clockRef}
          type="button"
          className="taskbar__clock"
          aria-haspopup="dialog"
          aria-expanded={popup === "cal" ? "true" : "false"}
          title={clock.date}
          onClick={() => togglePopup("cal")}
        >
          {clock.time}
        </button>
      </div>
      <StartMenu open={popup === "start"} panelRef={startRef} onClose={closePopups} />
      <Calendar open={popup === "cal"} panelRef={calRef} onClose={closePopups} />
    </footer>
  );
}
