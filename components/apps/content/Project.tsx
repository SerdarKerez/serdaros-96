"use client";
/* Project details window. App: project (args {index}). */
import { useEffect, useRef } from "react";
import type { AppProps, OSApi } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { useLang } from "@/lib/i18n";
import { projectDetails } from "@/lib/projects";
import { label } from "@/lib/labels";
import { BlockView } from "./RichBlocks";
import { iconSvg, SvgSpan } from "./shared";

let projectWin: string | null = null;

/** Close an open project window (singleton) and reopen it with the new index. */
export function openProject(os: OSApi, index: number) {
  if (projectWin != null) {
    try { os.closeWindow(projectWin); } catch { /* ignore */ }
    projectWin = null;
  }
  setTimeout(() => os.openApp("project", { index }), 0);
}

export default function Project({ winId, args, setTitle, close }: AppProps) {
  const a = (args || {}) as Record<string, unknown>;
  const { lang, t } = useLang();
  const p = getContent(lang).projects[Number(a.index) | 0];
  const setTitleRef = useRef(setTitle);

  useEffect(() => {
    projectWin = winId;
    return () => { if (projectWin === winId) projectWin = null; };
  }, [winId]);

  useEffect(() => { if (p) setTitleRef.current(p.name); }, [p]);

  if (!p) return <p className="project-card__missing">{t("Proje bulunamadı.", "Project not found.")}</p>;

  const techs = String(p.tech || "").split(/\s*[·,|]\s*/).filter(Boolean);
  const d = projectDetails(lang, p.slug);
  return (
    <div className="project-card">
      <div className="file-browser__address">
        <span>{t("Adres", "Address")}</span>
        <div>
          <SvgSpan className="file-browser__address-icon" svg={iconSvg("folder")} />
          <span>{t("Masaüstü", "Desktop") + " / " + (label("projects", lang) || "My Projects") + " / " + p.name}</span>
        </div>
      </div>
      <div className="project-card__content">
        {d && (
          // eslint-disable-next-line @next/next/no-img-element -- static local SVG
          <img className="project-card__cover" src={d.cover} alt={d.coverAlt} draggable={false} />
        )}
        <div className="project-card__head">
          <SvgSpan className="project-card__icon" hidden svg={iconSvg(p.icon || "folder")} />
          <div>
            <p className="project-card__eyebrow">{t("Proje dosyası", "Project file")}</p>
            <h3>{p.name}</h3>
          </div>
        </div>
        <p className="project-card__desc">{p.desc || ""}</p>
        <dl className="project-card__meta">
          {d && (
            <>
              <dt>{t("Durum", "Status")}</dt>
              <dd><span className="project-card__status">{d.status}</span></dd>
              <dt>{t("Rol", "Role")}</dt>
              <dd>{d.role}</dd>
              <dt>{t("Dönem", "Period")}</dt>
              <dd>{d.period}</dd>
            </>
          )}
          <dt>{t("Teknolojiler", "Technologies")}</dt>
          <dd>
            {techs.map((tech) => (
              <span key={tech} className="project-card__chip">{tech}</span>
            ))}
          </dd>
          <dt>{t("Bağlantı", "Link")}</dt>
          <dd>{p.link ? p.link : t("Yakında eklenecek.", "Coming soon.")}</dd>
        </dl>
        {d && d.highlights.length > 0 && (
          <ul className="project-card__highlights">
            {d.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        )}
        {d && (
          <div className="blog-post__body project-card__body">
            {d.blocks.map((b, i) => <BlockView key={i} block={b} />)}
          </div>
        )}
      </div>
      <div className="project-card__actions">
        <button type="button" onClick={close}>{t("Kapat", "Close")}</button>
        <button
          type="button"
          className="project-card__primary"
          disabled={!p.link}
          onClick={() => { if (p.link) window.open(p.link, "_blank", "noopener"); }}
        >
          {t("Projeyi aç ↗", "Open project ↗")}
        </button>
      </div>
      <div className="file-browser__status">
        <span>{techs.length + t(" teknoloji", techs.length === 1 ? " technology" : " technologies")}</span>
        <span>SerdarOS 96</span>
      </div>
    </div>
  );
}
