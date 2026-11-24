"use client";
import type { Photo } from "@/lib/content";
import type { SiteData } from "@/lib/site-data/types";
import { move, patchSynced, removeAt, type GroupProps } from "../model";
import { ItemTools, Section, TextField } from "../fields";
import { ImageField } from "../ImageField";
import { useAdminLang } from "../i18n";

const SHARED: (keyof Photo)[] = ["src"];

function withPhotos(d: SiteData, fn: (p: Photo[]) => Photo[]): SiteData {
  return {
    ...d,
    content: { tr: { ...d.content.tr, photos: fn(d.content.tr.photos) }, en: { ...d.content.en, photos: fn(d.content.en.photos) } },
  };
}

export function GalleryGroup({ data, lang, update }: GroupProps) {
  const photos = data.content[lang].photos;
  const { t } = useAdminLang();

  const set = (i: number, patch: Partial<Photo>) =>
    update((d) => {
      const next = patchSynced({ tr: d.content.tr.photos, en: d.content.en.photos }, lang, i, patch, SHARED);
      return { ...d, content: { tr: { ...d.content.tr, photos: next.tr }, en: { ...d.content.en, photos: next.en } } };
    });

  return (
    <Section
      title={t("Galeri", "Gallery")}
      desc={t("Galeri penceresindeki fotoğraflar. Görsel ortak, açıklama dile göre.", "Photos in the Gallery window. The image is shared, the caption is per language.")}
      actions={
        <button type="button" className="adm-btn adm-btn--small" onClick={() => update((d) => withPhotos(d, (p) => [...p, { src: "", caption: "" }]))}>
          {t("+ Fotoğraf ekle", "+ Add photo")}
        </button>
      }
    >
      {photos.length === 0 && <p className="adm-muted">{t("Galeri boş. Boşken site örnek renk kartları gösterir.", "Gallery is empty. While empty, the site shows sample color cards.")}</p>}
      <ol className="adm-gallery">
        {photos.map((p, i) => (
          <li key={i} className="adm-photo">
            <div className="adm-photo__head">
              <span className="adm-acc__num">{i + 1}</span>
              <ItemTools
                what={t(`${i + 1}. fotoğraf`, `Photo ${i + 1}`)}
                index={i}
                count={photos.length}
                onMove={(dir) => update((d) => withPhotos(d, (ps) => move(ps, i, dir)))}
                onDelete={() => {
                  if (window.confirm(t(`${i + 1}. fotoğraf TR ve EN'den silinsin mi?`, `Delete photo ${i + 1} from both TR and EN?`))) update((d) => withPhotos(d, (ps) => removeAt(ps, i)));
                }}
              />
            </div>
            <ImageField compact label={t("Görsel", "Image")} shared value={p.src} onChange={(v) => set(i, { src: v })} />
            <TextField label={t("Açıklama", "Caption")} value={p.caption} onChange={(v) => set(i, { caption: v })} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
