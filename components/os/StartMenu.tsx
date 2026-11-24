"use client";
/* SerdarOS 96 — start menu panel (profile header, items from getContent(lang).startMenu, language switch). */
import { Fragment, useEffect, useRef, type RefObject } from "react";
import type { Profile } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { useLang, type Lang } from "@/lib/i18n";
import { ICONS, RawSvg } from "@/components/icons";
import { avatarSvg } from "@/components/apps/content/avatars";
import { metaFor } from "@/components/apps/registry";
import { menuKeys } from "./ContextMenu";
import { useOS } from "./OSContext";

export function osName(lang: Lang): string {
  return getContent(lang).owner?.os || "SerdarOS 96";
}

export function avatarIcon(p: Profile | null): string {
  if (p && p.avatar) {
    try {
      const sv = avatarSvg(p.avatar);
      if (sv) return sv;
    } catch {
      /* fall back */
    }
    return ICONS["avatar-" + p.avatar] || ICONS[p.avatar] || ICONS.user || "";
  }
  return ICONS["avatar-guitar"] || ICONS.user || "";
}

export default function StartMenu({
  open,
  panelRef,
  onClose,
}: {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: (returnFocus: boolean) => void;
}) {
  const { profile, openApp } = useOS();
  const { lang, toggle } = useLang();
  const C = getContent(lang);
  const langItem = (
    <button
      type="button"
      role="menuitem"
      className="start-menu__item start-menu__item--lang"
      data-id="lang"
      lang={lang === "en" ? "tr" : "en"}
      onClick={() => {
        onClose(false);
        toggle();
      }}
    >
      <span className="start-menu__lang-badge" aria-hidden="true">
        {lang === "en" ? "TR" : "EN"}
      </span>
      <span>{lang === "en" ? "Türkçe" : "English"}</span>
    </button>
  );
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) panelRef.current?.querySelector<HTMLButtonElement>(".start-menu__item")?.focus();
    wasOpen.current = open;
  }, [open, panelRef]);

  return (
    <div
      ref={panelRef}
      className="taskbar-panel taskbar-panel--start"
      hidden={!open}
      onKeyDown={(e) => {
        if (panelRef.current) menuKeys(panelRef.current, e, onClose);
      }}
    >
      {open && (
        <>
          <div className="start-menu__profile">
            <span className="start-menu__avatar" dangerouslySetInnerHTML={{ __html: avatarIcon(profile) }} />
            <div>
              <h2>{profile.name}</h2>
              <p>Guest on {osName(lang)}</p>
            </div>
            <span className="start-menu__version" aria-hidden="true">
              96
            </span>
          </div>
          <div className="start-menu__items" role="menu">
            {(C.startMenu || []).map((id) => {
              const m = metaFor(id, lang);
              const label = m.title;
              const ic = id === "profile" ? avatarIcon(profile) : ICONS[m.icon] || ICONS.text || "";
              return (
                <Fragment key={id}>
                  {id === "restart" && langItem}
                  <button
                    type="button"
                    role="menuitem"
                    className={"start-menu__item" + (id === "restart" ? " start-menu__item--restart" : "")}
                    data-id={id}
                    onClick={() => {
                      onClose(false);
                      openApp(id);
                    }}
                  >
                    <RawSvg svg={ic} />
                    <span>{label}</span>
                  </button>
                </Fragment>
              );
            })}
            {!(C.startMenu || []).includes("restart") && langItem}
          </div>
          <div className="start-menu__footer">{osName(lang)}</div>
        </>
      )}
    </div>
  );
}
