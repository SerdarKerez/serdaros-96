"use client";
import { withContent, type GroupProps } from "../model";
import { Section, TextArea, TextField } from "../fields";
import { useAdminLang } from "../i18n";

const KNOWN: Record<string, [tr: string, en: string]> = {
  about: ["Hakkımda", "About"],
  welcome: ["Hoş Geldin", "Welcome"],
  copyright: ["Telif Hakkı", "Copyright"],
  privacy: ["Gizlilik", "Privacy"],
};

export function TextsGroup({ data, lang, update }: GroupProps) {
  const files = data.content[lang].files;
  const { t } = useAdminLang();
  const keys = [...Object.keys(KNOWN).filter((k) => k in files), ...Object.keys(files).filter((k) => !(k in KNOWN))];
  const set = (key: string, field: "title" | "text", v: string) =>
    update((d) => withContent(d, lang, (c) => ({ ...c, files: { ...c.files, [key]: { ...c.files[key], [field]: v } } })));

  return (
    <>
      {keys.map((k) => (
        <Section key={k} title={KNOWN[k] ? t(...KNOWN[k]) : k} desc={t(`Masaüstündeki “${files[k].title}” dosyası.`, `The “${files[k].title}” file on the desktop.`)}>
          <div className="adm-grid">
            <TextField label={t("Dosya adı (pencere başlığı)", "File name (window title)")} value={files[k].title} onChange={(v) => set(k, "title", v)} wide />
            <TextArea label={t("Metin", "Text")} rows={k === "about" || k === "welcome" ? 14 : 4} value={files[k].text} onChange={(v) => set(k, "text", v)} />
          </div>
        </Section>
      ))}
    </>
  );
}
