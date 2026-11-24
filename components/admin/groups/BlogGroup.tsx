"use client";
import type { BlogPost } from "@/lib/blog/types";
import {
  emptyPost, errorFor, fieldId, move, patchSynced, remapOpen, removeAt, today, uniqueSlug,
  type GroupProps,
} from "../model";
import { ParsedText, Section, TextArea, TextField, commas } from "../fields";
import { ImageField } from "../ImageField";
import { BlockEditor } from "../BlockEditor";
import { AccordionItem, toggleIn } from "../Accordion";
import { useAdminLang } from "../i18n";

const SHARED: (keyof BlogPost)[] = ["slug", "date"];

export function BlogGroup({ data, lang, update, errors, open, setOpen }: GroupProps) {
  const posts = data.blog[lang];
  const { t } = useAdminLang();

  const set = (i: number, patch: Partial<BlogPost>) =>
    update((d) => ({ ...d, blog: patchSynced(d.blog, lang, i, patch, SHARED) }));

  const add = () => {
    update((d) => {
      const slug = uniqueSlug("yeni-yazi", [...d.blog.tr, ...d.blog.en].map((p) => p.slug));
      const post = emptyPost(slug, today());
      return { ...d, blog: { tr: [...d.blog.tr, post], en: [...d.blog.en, { ...post, title: "New post" }] } };
    });
    setOpen((s) => new Set(s).add(posts.length));
  };

  const remove = (i: number) => {
    const name = posts[i].title || posts[i].slug;
    if (!window.confirm(t(`“${name}” yazısı TR ve EN'den silinsin mi?`, `Delete post “${name}” from both TR and EN?`))) return;
    update((d) => ({ ...d, blog: { tr: removeAt(d.blog.tr, i), en: removeAt(d.blog.en, i) } }));
    setOpen((s) => remapOpen(s, { remove: i }));
  };

  const reorder = (i: number, dir: -1 | 1) => {
    if (i + dir < 0 || i + dir >= posts.length) return;
    update((d) => ({ ...d, blog: { tr: move(d.blog.tr, i, dir), en: move(d.blog.en, i, dir) } }));
    setOpen((s) => remapOpen(s, { move: [i, i + dir] }));
  };

  return (
    <Section
      title={t("Blog yazıları", "Blog posts")}
      desc={t("Ekleme, silme ve sıralama iki dile birden uygulanır. Slug, tarih ve kapak görseli ortaktır.", "Adding, deleting and reordering apply to both languages. Slug, date and cover image are shared.")}
      actions={<button type="button" className="adm-btn adm-btn--small" onClick={add}>{t("+ Yazı ekle", "+ Add post")}</button>}
    >
      {posts.length === 0 && <p className="adm-muted">{t("Henüz yazı yok.", "No posts yet.")}</p>}
      <div className="adm-acc-list">
        {posts.map((p, i) => {
          const err = (f: string) => errorFor(errors, "blog", lang, i, f);
          return (
            <AccordionItem
              key={i}
              id={`acc-post-${i}`}
              title={p.title}
              meta={`${p.date} · ${p.slug}`}
              open={open.has(i)}
              invalid={errors.some((e) => e.group === "blog" && e.lang === lang && e.index === i)}
              onToggle={() => setOpen((s) => toggleIn(s, i))}
              index={i}
              count={posts.length}
              onMove={(dir) => reorder(i, dir)}
              onDelete={() => remove(i)}
              what={p.title || t("Yazı", "Post")}
            >
              <div className="adm-grid">
                <TextField id={fieldId("post", lang, i, "title")} label={t("Başlık", "Title")} value={p.title} error={err("title")} wide onChange={(v) => set(i, { title: v })} />
                <TextField
                  id={fieldId("post", lang, i, "slug")}
                  label="Slug"
                  mono
                  shared
                  value={p.slug}
                  error={err("slug")}
                  hint={t("Küçük harf, rakam ve tire.", "Lowercase letters, digits and hyphens.")}
                  onChange={(v) => set(i, { slug: v })}
                />
                <TextField label={t("Tarih", "Date")} type="date" shared value={p.date} onChange={(v) => set(i, { date: v })} />
                <ParsedText label={t("Etiketler (virgülle ayır)", "Tags (comma separated)")} value={p.tags} {...commas} wide onChange={(tags) => set(i, { tags })} />
                <ImageField label={t("Kapak görseli", "Cover image")} value={p.cover} onChange={(v) => set(i, { cover: v })} />
                <TextField label={t("Kapak alt metni", "Cover alt text")} value={p.coverAlt} wide onChange={(v) => set(i, { coverAlt: v })} />
                <TextArea label={t("Özet (1-2 cümle)", "Summary (1-2 sentences)")} rows={3} value={p.summary} onChange={(v) => set(i, { summary: v })} />
                <BlockEditor key={lang} blocks={p.blocks} onChange={(blocks) => set(i, { blocks })} />
              </div>
            </AccordionItem>
          );
        })}
      </div>
    </Section>
  );
}
