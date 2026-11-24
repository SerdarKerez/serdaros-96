"use client";
/* SerdarOS 96 — touch edition: home screen + bottom dock. */
import { getContent } from "@/lib/content-i18n";
import { useLang } from "@/lib/i18n";
import { ICONS, RawSvg } from "@/components/icons";
import { avatarIcon, osName } from "./StartMenu";
import { LangToggle, useClock } from "./Taskbar";
import { useOS, useWM, winTitle } from "./OSContext";

const HOME_APPS: [string, string, string][] = [
  ["projects", "Projects", "folder"], ["photos", "Gallery", "photos"], ["notes", "Blog", "notes"], ["games", "Games", "games"],
  ["about", "About me", "text"], ["mail", "Contact Me", "mail"], ["calculator", "Calculator", "calculator"], ["computer", "Files", "computer"],
  ["recycle", "Recycle Bin", "trash"], ["help", "Help", "help"], ["profile", "Profile", "user"],
];
const DOCK: [string, string, string][] = [
  ["home", "Home", "desktop"], ["notes", "Blog", "notes"], ["photos", "Gallery", "photos"], ["games", "Games", "games"], ["profile", "Profile", "user"],
];

/** Turkish names for the short touch labels above. */
const TOUCH_TR: Record<string, string> = {
  Projects: "Projeler", Gallery: "Galeri", Games: "Oyunlar", "About me": "Hakkımda", "Contact Me": "İletişim",
  Calculator: "Hesap Mak.", Files: "Dosyalar", "Recycle Bin": "Çöp Kutusu", Help: "Yardım", Profile: "Profil", Home: "Ana Sayfa",
};
const touchLabel = (en: string, lang: string) => (lang === "tr" ? TOUCH_TR[en] ?? en : en);

function icon(key: string): string {
  return ICONS[key] || ICONS.text || "";
}

export function TouchHome() {
  const { wm, dispatch, setMode } = useWM();
  const { openApp, profile, restart } = useOS();
  const clock = useClock();
  const { lang, t } = useLang();
  const shortName = getContent(lang).owner?.shortName || "Serdar";
  const anyVisible = wm.order.some((k) => wm.wins[k] && !wm.wins[k].minimized);
  const hidden = !wm.touch || anyVisible;

  return (
    <div className="touch-home" hidden={hidden}>
      <header className="touch-home__header" lang="en">
        <div>
          <div className="touch-home__edition">Touch edition</div>
          <h1>
            {osName(lang).replace(/ 96$/, "")} <span>96</span>
          </h1>
        </div>
        <div className="touch-home__header-side">
          <LangToggle className="touch-home__lang" />
          <time>{clock.time}</time>
        </div>
      </header>
      <section className="touch-home__welcome">
        <div>
          <p>Make yourself at home.</p>
          <h2>
            {t("Merhaba", "Hello")}, <span>{profile.name}</span> :)
          </h2>
          <span>{t(shortName + "'ın dünyasından küçük bir köşe.", "A small corner of " + shortName + "'s world.")}</span>
        </div>
        <button type="button" aria-label="Profile" onClick={() => openApp("profile")}>
          <RawSvg svg={avatarIcon(profile)} />
        </button>
      </section>
      <div className="touch-home__grid">
        {HOME_APPS.map((a) => (
          <button key={a[0]} type="button" className="touch-home__app" onClick={() => openApp(a[0])}>
            <span className="touch-home__icon" dangerouslySetInnerHTML={{ __html: icon(a[2]) }} />
            <span>{touchLabel(a[1], lang)}</span>
          </button>
        ))}
      </div>
      <section className="touch-home__recent" hidden={!wm.order.length}>
        {wm.order.length > 0 && <h2>{t("Kaldığın yerden devam et", "Pick up where you left off")}</h2>}
        {wm.order.map((k) => {
          const w = wm.wins[k];
          if (!w) return null;
          const title = winTitle(w, lang);
          return (
            <div key={k}>
              <button type="button" className="touch-home__resume" onClick={() => dispatch({ type: "focus", id: k })}>
                <RawSvg svg={icon(w.icon)} />
                <span>{title}</span>
                <span aria-hidden="true">›</span>
              </button>
              <button type="button" className="touch-home__close" aria-label={"Close " + title} onClick={() => dispatch({ type: "close", id: k })}>
                ×
              </button>
            </div>
          );
        })}
      </section>
      <div className="touch-home__options">
        <button type="button" data-act="restart" onClick={restart}>
          Restart
        </button>
        <button type="button" data-act="desktop" onClick={() => setMode("desktop")}>
          Desktop edition
        </button>
      </div>
      <p className="touch-home__footer">Personal edition · Made by {shortName}</p>
    </div>
  );
}

export function TouchDock() {
  const { wm, showHome } = useWM();
  const { openApp } = useOS();
  const { lang } = useLang();
  let cur = "home";
  const aw = wm.activeId ? wm.wins[wm.activeId] : null;
  if (wm.touch && aw && !aw.minimized) {
    let a = aw.appId;
    if (a === "snake" || a === "mines" || a === "stack") a = "games";
    cur = a;
  }
  return (
    <nav className="touch-dock" aria-label="Dock">
      {DOCK.map((d) => (
        <button
          key={d[0]}
          type="button"
          data-id={d[0]}
          aria-current={d[0] === cur ? "page" : undefined}
          onClick={() => (d[0] === "home" ? showHome() : openApp(d[0]))}
        >
          <RawSvg svg={icon(d[2])} />
          <span>{touchLabel(d[1], lang)}</span>
        </button>
      ))}
    </nav>
  );
}

export default TouchHome;
