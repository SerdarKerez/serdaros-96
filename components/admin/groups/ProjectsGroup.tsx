"use client";
import type { Project } from "@/lib/content";
import type { ProjectDetails } from "@/lib/projects/types";
import type { Lang } from "@/lib/i18n";
import type { SiteData } from "@/lib/site-data/types";
import { ICONS } from "@/components/icons";
import {
  LANGS, emptyDetails, errorFor, fieldId, move, other, patchSynced, remapOpen, removeAt, uniqueSlug,
  type GroupProps,
} from "../model";
import { ParsedText, Section, TextArea, TextField, lines } from "../fields";
import { ImageField } from "../ImageField";
import { BlockEditor } from "../BlockEditor";
import { AccordionItem, toggleIn } from "../Accordion";
import { useAdminLang } from "../i18n";

const CARD_SHARED: (keyof Project)[] = ["slug", "tech", "link", "icon"];
const DETAIL_SHARED: (keyof ProjectDetails)[] = [];
const ICON_NAMES = Object.keys(ICONS).sort();

function cardsOf(d: SiteData) {
  return { tr: d.content.tr.projects, en: d.content.en.projects };
}

function withCards(d: SiteData, cards: Record<Lang, Project[]>): SiteData {
  return {
    ...d,
    content: {
      tr: { ...d.content.tr, projects: cards.tr },
      en: { ...d.content.en, projects: cards.en },
    },
  };
}

/** Patch the details page of slug `slug` in `lang`, creating it if the card has none yet. */
function patchDetails(list: ProjectDetails[], slug: string, patch: Partial<ProjectDetails>): ProjectDetails[] {
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return [...list, { ...emptyDetails(slug), ...patch }];
  const out = list.slice();
  out[i] = { ...out[i], ...patch };
  return out;
}

export function ProjectsGroup({ data, lang, update, errors, open, setOpen }: GroupProps) {
  const cards = data.content[lang].projects;
  const o = other(lang);
  const { t } = useAdminLang();

  const setCard = (i: number, patch: Partial<Project>) =>
    update((d) => {
      const before = cardsOf(d);
      let n = withCards(d, patchSynced(before, lang, i, patch, CARD_SHARED));
      if ("slug" in patch && patch.slug !== undefined) {
        // Keep the long-form pages attached to their cards in both languages.
        const projects = { ...n.projects };
        for (const l of LANGS) {
          const old = before[l][i]?.slug;
          if (old === undefined) continue;
          projects[l] = projects[l].map((p) => (p.slug === old ? { ...p, slug: patch.slug! } : p));
        }
        n = { ...n, projects };
      }
      return n;
    });

  const setDetails = (i: number, patch: Partial<ProjectDetails>) =>
    update((d) => {
      const projects = { ...d.projects };
      projects[lang] = patchDetails(projects[lang], d.content[lang].projects[i].slug, patch);
      const shared = DETAIL_SHARED.filter((k) => k in patch);
      const twin = d.content[o].projects[i];
      if (shared.length && twin) {
        const sp: Partial<ProjectDetails> = {};
        for (const k of shared) Object.assign(sp, { [k]: patch[k] });
        projects[o] = patchDetails(projects[o], twin.slug, sp);
      }
      return { ...d, projects };
    });

  const add = () => {
    update((d) => {
      const taken = [...d.content.tr.projects, ...d.content.en.projects].map((p) => p.slug);
      const slug = uniqueSlug("yeni-proje", taken);
      const card: Project = { slug, name: "Yeni proje", icon: "folder", desc: "", tech: "", link: "" };
      const c = cardsOf(d);
      return {
        ...withCards(d, { tr: [...c.tr, card], en: [...c.en, { ...card, name: "New project" }] }),
        projects: { tr: [...d.projects.tr, emptyDetails(slug)], en: [...d.projects.en, emptyDetails(slug)] },
      };
    });
    setOpen((s) => new Set(s).add(cards.length));
  };

  const remove = (i: number) => {
    const name = cards[i].name || cards[i].slug;
    if (!window.confirm(t(`“${name}” projesi TR ve EN'den silinsin mi?`, `Delete project “${name}” from both TR and EN?`))) return;
    update((d) => {
      const c = cardsOf(d);
      const projects = { ...d.projects };
      for (const l of LANGS) {
        const slug = c[l][i]?.slug;
        projects[l] = projects[l].filter((p) => p.slug !== slug);
      }
      return { ...withCards(d, { tr: removeAt(c.tr, i), en: removeAt(c.en, i) }), projects };
    });
    setOpen((s) => remapOpen(s, { remove: i }));
  };

  const reorder = (i: number, dir: -1 | 1) => {
    if (i + dir < 0 || i + dir >= cards.length) return;
    update((d) => {
      const c = cardsOf(d);
      return withCards(d, { tr: move(c.tr, i, dir), en: move(c.en, i, dir) });
    });
    setOpen((s) => remapOpen(s, { move: [i, i + dir] }));
  };

  return (
    <Section
      title={t("Projeler", "Projects")}
      desc={t("Projelerim klasöründeki kartlar ve her kartın detay sayfası. Ekleme, silme ve sıralama iki dile birden uygulanır.", "Cards in the My Projects folder and each card's detail page. Adding, deleting and reordering apply to both languages.")}
      actions={<button type="button" className="adm-btn adm-btn--small" onClick={add}>{t("+ Proje ekle", "+ Add project")}</button>}
    >
      {cards.length === 0 && <p className="adm-muted">{t("Henüz proje yok.", "No projects yet.")}</p>}
      <div className="adm-acc-list">
        {cards.map((p, i) => {
          const det = data.projects[lang].find((x) => x.slug === p.slug) ?? emptyDetails(p.slug);
          const err = (f: string) => errorFor(errors, "projects", lang, i, f);
          const invalid = errors.some((e) => e.group === "projects" && e.lang === lang && e.index === i);
          return (
            <AccordionItem
              key={i}
              id={`acc-project-${i}`}
              title={p.name}
              meta={p.slug}
              open={open.has(i)}
              invalid={invalid}
              onToggle={() => setOpen((s) => toggleIn(s, i))}
              index={i}
              count={cards.length}
              onMove={(dir) => reorder(i, dir)}
              onDelete={() => remove(i)}
              what={p.name || t("Proje", "Project")}
            >
              <h3 className="adm-subhead">{t("Kart", "Card")}</h3>
              <div className="adm-grid">
                <TextField id={fieldId("project", lang, i, "name")} label={t("Proje adı", "Project name")} value={p.name} error={err("name")} onChange={(v) => setCard(i, { name: v })} />
                <TextField
                  id={fieldId("project", lang, i, "slug")}
                  label="Slug"
                  mono
                  shared
                  value={p.slug}
                  error={err("slug")}
                  hint={t("Küçük harf, rakam ve tire. Detay sayfasının adresi.", "Lowercase letters, digits and hyphens. The detail page address.")}
                  onChange={(v) => setCard(i, { slug: v })}
                />
                <TextArea label={t("Kısa açıklama", "Short description")} rows={2} value={p.desc} onChange={(v) => setCard(i, { desc: v })} />
                <TextField label={t("Teknolojiler", "Technologies")} shared value={p.tech} placeholder="Python · SQL · …" onChange={(v) => setCard(i, { tech: v })} />
                <TextField label={t("Bağlantı", "Link")} shared type="url" value={p.link} placeholder="https://github.com/…" onChange={(v) => setCard(i, { link: v })} />
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor={`icon-${lang}-${i}`}>
                    {t("İkon", "Icon")} <span className="adm-chip" title={t("Bu alan TR ve EN için ortaktır", "This field is shared by TR and EN")}>TR+EN</span>
                  </label>
                  <select id={`icon-${lang}-${i}`} className="adm-input adm-select" value={p.icon} onChange={(e) => setCard(i, { icon: e.target.value })}>
                    {!ICON_NAMES.includes(p.icon) && <option value={p.icon}>{p.icon || t("(yok)", "(none)")}</option>}
                    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <h3 className="adm-subhead">{t("Detay sayfası", "Detail page")}</h3>
              <div className="adm-grid">
                <TextField label={t("Durum", "Status")} value={det.status} placeholder={t("Geliştiriliyor / Konsept / Tamamlandı", "In development / Concept / Completed")} onChange={(v) => setDetails(i, { status: v })} />
                <TextField label={t("Rol", "Role")} value={det.role} placeholder={t("Tek geliştirici", "Solo developer")} onChange={(v) => setDetails(i, { role: v })} />
                <TextField label={t("Dönem", "Period")} value={det.period} placeholder={t("2025 – devam ediyor", "2025 – ongoing")} onChange={(v) => setDetails(i, { period: v })} />
                <ImageField label={t("Kapak görseli (1200×630)", "Cover image (1200×630)")} value={det.cover} onChange={(v) => setDetails(i, { cover: v })} />
                <TextField label={t("Kapak alt metni", "Cover alt text")} value={det.coverAlt} wide onChange={(v) => setDetails(i, { coverAlt: v })} />
                <ParsedText label={t("Öne çıkanlar (her satır bir madde)", "Highlights (one per line)")} rows={4} wide value={det.highlights} {...lines} onChange={(v) => setDetails(i, { highlights: v })} />
                <BlockEditor key={lang} blocks={det.blocks} onChange={(blocks) => setDetails(i, { blocks })} />
              </div>
            </AccordionItem>
          );
        })}
      </div>
    </Section>
  );
}
