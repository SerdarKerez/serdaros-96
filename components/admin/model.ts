/* Admin editor model: groups, dirty tracking, language-synced list helpers and validation. */
import type { Block, BlogPost } from "@/lib/blog/types";
import type { ProjectDetails } from "@/lib/projects/types";
import type { Lang } from "@/lib/i18n";
import { SITE_KEYS, type ByLang, type SiteData, type SiteKey } from "@/lib/site-data/types";
import type { Content } from "@/lib/content";
import type { T } from "./i18n";

export const LANGS: Lang[] = ["tr", "en"];
export const other = (l: Lang): Lang => (l === "tr" ? "en" : "tr");

export type GroupId = "general" | "texts" | "projects" | "blog" | "gallery";

export const GROUP_IDS: GroupId[] = ["general", "texts", "projects", "blog", "gallery"];

/** Sidebar groups with labels in the current admin UI language. */
export const groupsFor = (t: T): { id: GroupId; label: string; hint: string }[] => [
  { id: "general", label: t("Genel & İletişim", "General & Contact"), hint: t("Kimlik, iletişim, görseller, isimler", "Identity, contact, images, names") },
  { id: "texts", label: t("Metinler", "Texts"), hint: t("Hakkımda, Hoş Geldin, telif, gizlilik", "About, Welcome, copyright, privacy") },
  { id: "projects", label: t("Projeler", "Projects"), hint: t("Proje kartları ve detay sayfaları", "Project cards and detail pages") },
  { id: "blog", label: "Blog", hint: t("Yazılar ve içerik blokları", "Posts and content blocks") },
  { id: "gallery", label: t("Galeri", "Gallery"), hint: t("Fotoğraflar ve açıklamalar", "Photos and captions") },
];

/** The slice of SiteData each sidebar group edits (both languages), used for dirty dots. */
function groupSlice(d: SiteData, g: GroupId): unknown {
  switch (g) {
    case "general":
      return [d.content.tr.owner, d.content.en.owner, d.labels];
    case "texts":
      return [d.content.tr.files, d.content.en.files];
    case "projects":
      return [d.content.tr.projects, d.content.en.projects, d.projects];
    case "blog":
      return d.blog;
    case "gallery":
      return [d.content.tr.photos, d.content.en.photos];
  }
}

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

export function dirtyGroups(cur: SiteData, saved: SiteData): GroupId[] {
  return GROUP_IDS.filter((g) => !same(groupSlice(cur, g), groupSlice(saved, g)));
}

export function changedKeys(cur: SiteData, saved: SiteData): SiteKey[] {
  return SITE_KEYS.filter((k) => !same(cur[k], saved[k]));
}

/* ---------- list helpers ---------- */

export function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const out = arr.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

export function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, k) => k !== i);
}

export function replaceAt<T>(arr: T[], i: number, v: T): T[] {
  if (i < 0 || i >= arr.length) return arr;
  const out = arr.slice();
  out[i] = v;
  return out;
}

/** Index of an open-accordion item after a move/remove, so the open state follows the item. */
export function remapOpen(open: Set<number>, op: { move: [number, number] } | { remove: number }): Set<number> {
  const out = new Set<number>();
  for (const i of open) {
    if ("move" in op) {
      const [a, b] = op.move;
      out.add(i === a ? b : i === b ? a : i);
    } else if (i !== op.remove) out.add(i > op.remove ? i - 1 : i);
  }
  return out;
}

export function uniqueSlug(base: string, taken: string[]): string {
  let s = base;
  for (let n = 2; taken.includes(s); n++) s = `${base}-${n}`;
  return s;
}

export const emptyDetails = (slug: string): ProjectDetails => ({
  slug, status: "", role: "", period: "", cover: "", coverAlt: "", highlights: [], blocks: [],
});

export const emptyPost = (slug: string, date: string): BlogPost => ({
  slug, title: "Yeni yazı", date, tags: [], cover: "", coverAlt: "", summary: "", blocks: [],
});

export function newBlock(type: Block["type"]): Block {
  switch (type) {
    case "p": case "h": case "note": return { type, text: "" };
    case "quote": return { type, text: "", cite: "" };
    case "img": return { type, src: "", alt: "", caption: "" };
    case "list": return { type, items: [], ordered: false };
    case "code": return { type, lang: "", code: "" };
    case "table": return { type, head: [], rows: [] };
  }
}

/* ---------- validation ---------- */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface FieldError {
  group: GroupId;
  lang: Lang;
  index: number;       // accordion item
  field: string;       // "slug" | "title" | "name"
  fieldId: string;     // DOM id to focus
  message: string;
}

export const fieldId = (scope: string, lang: Lang, i: number, field: string) => `f-${scope}-${lang}-${i}-${field}`;

function slugErrors(list: { slug: string }[], lang: Lang, group: GroupId, scope: string, t: T): FieldError[] {
  const out: FieldError[] = [];
  list.forEach((it, i) => {
    const s = it.slug.trim();
    let message = "";
    if (!s) message = t("Slug zorunlu.", "Slug is required.");
    else if (!SLUG_RE.test(s)) message = t("Slug küçük harf, rakam ve tire olmalı (ör. benim-projem).", "Slug must use lowercase letters, digits and hyphens (e.g. my-project).");
    else if (list.findIndex((o) => o.slug.trim() === s) !== i) message = t(`"${s}" slug'ı bu listede zaten var.`, `Slug "${s}" already exists in this list.`);
    if (message) out.push({ group, lang, index: i, field: "slug", fieldId: fieldId(scope, lang, i, "slug"), message });
  });
  return out;
}

/** Validates both languages; messages are in the admin UI language given by `t`. */
export function validate(d: SiteData, t: T): FieldError[] {
  const errs: FieldError[] = [];
  for (const lang of LANGS) {
    const projects = d.content[lang].projects;
    errs.push(...slugErrors(projects, lang, "projects", "project", t));
    projects.forEach((p, i) => {
      if (!p.name.trim())
        errs.push({ group: "projects", lang, index: i, field: "name", fieldId: fieldId("project", lang, i, "name"), message: t("Proje adı zorunlu.", "Project name is required.") });
    });
    const posts = d.blog[lang];
    errs.push(...slugErrors(posts, lang, "blog", "post", t));
    posts.forEach((p, i) => {
      if (!p.title.trim())
        errs.push({ group: "blog", lang, index: i, field: "title", fieldId: fieldId("post", lang, i, "title"), message: t("Başlık zorunlu.", "Title is required.") });
    });
  }
  return errs;
}

export function errorFor(errs: FieldError[], group: GroupId, lang: Lang, index: number, field: string): string | undefined {
  return errs.find((e) => e.group === group && e.lang === lang && e.index === index && e.field === field)?.message;
}

/* ---------- editor plumbing ---------- */

export type Update = (fn: (d: SiteData) => SiteData) => void;

export interface GroupProps {
  data: SiteData;
  lang: Lang;
  update: Update;
  errors: FieldError[];
  open: Set<number>;
  setOpen: (fn: (o: Set<number>) => Set<number>) => void;
}

export function withContent(d: SiteData, lang: Lang, fn: (c: Content) => Content): SiteData {
  return { ...d, content: { ...d.content, [lang]: fn(d.content[lang]) } };
}

/** The subset of `patch` whose keys are language-independent. */
export function sharedPart<T extends object>(patch: Partial<T>, keys: readonly (keyof T)[]): Partial<T> | null {
  const out: Partial<T> = {};
  let any = false;
  for (const k of keys) if (k in patch) { out[k] = patch[k]; any = true; }
  return any ? out : null;
}

/** Patch item `i` of a per-language list; language-independent keys are mirrored into the twin at the same index. */
export function patchSynced<T extends object>(lists: ByLang<T[]>, lang: Lang, i: number, patch: Partial<T>, keys: readonly (keyof T)[]): ByLang<T[]> {
  const o = other(lang);
  const shared = sharedPart(patch, keys);
  return {
    ...lists,
    [lang]: replaceAt(lists[lang], i, { ...lists[lang][i], ...patch }),
    [o]: shared && lists[o][i] ? replaceAt(lists[o], i, { ...lists[o][i], ...shared }) : lists[o],
  } as ByLang<T[]>;
}

export const today = () => new Date().toISOString().slice(0, 10);
