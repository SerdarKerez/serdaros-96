"use client";
import type { Content } from "@/lib/content";
import { LANGS, other, withContent, type GroupProps } from "../model";
import { Section, TextField } from "../fields";
import { ImageField } from "../ImageField";
import { useAdminLang } from "../i18n";

type Owner = Content["owner"];
const SHARED: (keyof Owner)[] = ["email", "github", "instagram", "linkedin", "photo", "wallpaper"];

export function GeneralGroup({ data, lang, update }: GroupProps) {
  const owner = data.content[lang].owner;
  const { t } = useAdminLang();
  const set = (k: keyof Owner, v: string) =>
    update((d) => {
      let n = withContent(d, lang, (c) => ({ ...c, owner: { ...c.owner, [k]: v } }));
      if (SHARED.includes(k)) n = withContent(n, other(lang), (c) => ({ ...c, owner: { ...c.owner, [k]: v } }));
      return n;
    });
  const f = (k: keyof Owner, label: string, extra?: { hint?: string; type?: string; placeholder?: string }) => (
    <TextField label={label} value={owner[k]} onChange={(v) => set(k, v)} shared={SHARED.includes(k)} {...extra} />
  );
  const labelIds = Object.keys(data.labels);

  return (
    <>
      <Section title={t("Kimlik", "Identity")} desc={t("Masaüstü, Başlat menüsü ve Hakkımda penceresinde görünen bilgiler.", "Details shown on the desktop, in the Start menu and in the About window.")}>
        <div className="adm-grid">
          {f("name", t("Ad soyad", "Full name"))}
          {f("shortName", t("Kısa ad", "Short name"))}
          {f("os", t("İşletim sistemi adı", "Operating system name"))}
          {f("edition", t("Sürüm adı", "Edition name"))}
          {f("tagline", t("Slogan / kısa tanıtım", "Tagline / short intro"), { hint: t("Başlat menüsü ve profil kartında görünür.", "Shown in the Start menu and on the profile card.") })}
          {f("location", t("Konum", "Location"))}
        </div>
      </Section>

      <Section title={t("İletişim", "Contact")} desc={t("Bağlantılar her iki dilde ortaktır.", "Links are shared by both languages.")}>
        <div className="adm-grid">
          {f("email", t("E-posta", "Email"), { type: "email" })}
          {f("github", "GitHub", { type: "url", placeholder: "https://github.com/…" })}
          {f("instagram", "Instagram", { type: "url", placeholder: "https://instagram.com/…" })}
          {f("linkedin", "LinkedIn", { type: "url", placeholder: "https://linkedin.com/in/…" })}
        </div>
      </Section>

      <Section
        title={t("Masaüstü arka planı", "Desktop wallpaper")}
        desc={t(
          "Sitedeki masaüstünün arka plan resmi. Tüm ziyaretçilerde aynı görünür; yatay ve en az 1920×1080 bir görsel önerilir.",
          "Background image of the site's desktop. Every visitor sees the same one; a landscape image of at least 1920×1080 is recommended.",
        )}
      >
        <ImageField label={t("Arka plan resmi", "Wallpaper image")} value={owner.wallpaper} onChange={(v) => set("wallpaper", v)} shared />
      </Section>

      <Section title={t("Vesikalık", "Portrait photo")} desc={t("Hakkımda.txt penceresinde görünen fotoğraf.", "The photo shown in the About Me.txt window.")}>
        <ImageField label={t("Vesikalık fotoğraf", "Portrait photo")} value={owner.photo} onChange={(v) => set("photo", v)} shared />
      </Section>

      <Section title={t("Klasör ve uygulama adları", "Folder and app names")} desc={t("İkonların altında ve pencere başlıklarında görünen isimler. İki dil yan yana düzenlenir.", "Names shown under icons and in window titles. Both languages are edited side by side.")}>
        <div className="adm-labels">
          <div className="adm-labels__row adm-labels__row--head">
            <span>{t("Kimlik", "ID")}</span>
            {LANGS.map((l) => <span key={l}>{l.toUpperCase()}</span>)}
          </div>
          {labelIds.map((id) => (
            <div className="adm-labels__row" key={id}>
              <code>{id}</code>
              {LANGS.map((l) => (
                <input
                  key={l}
                  className="adm-input"
                  aria-label={`${id} — ${l.toUpperCase()}`}
                  value={data.labels[id][l]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => ({ ...d, labels: { ...d.labels, [id]: { ...d.labels[id], [l]: v } } }));
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
