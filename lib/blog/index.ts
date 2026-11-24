/* Blog posts. Data: Supabase (site_content "blog") with fallback lib/blog/<slug>(.en).ts. */
import type { BlogPost } from "./types";
import type { Lang } from "@/lib/i18n";
import { siteData } from "@/lib/site-data/store";

export type { BlogPost, Block } from "./types";

const byDate = (a: BlogPost, b: BlogPost) => b.date.localeCompare(a.date);

/** Newest first, per language. Slugs are identical in both languages. */
export function getPosts(lang: Lang): BlogPost[] {
  return [...siteData().blog[lang]].sort(byDate);
}

export function findPost(lang: Lang, slug: string | undefined): BlogPost | undefined {
  return slug ? siteData().blog[lang].find((p) => p.slug === slug) : undefined;
}

/** ~200 words per minute. */
export function readingMinutes(post: BlogPost): number {
  const words = post.blocks
    .map((b) => {
      switch (b.type) {
        case "p":
        case "h":
        case "quote":
        case "note":
          return b.text;
        case "list":
          return b.items.join(" ");
        case "table":
          return b.rows.flat().join(" ");
        default:
          return "";
      }
    })
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const MONTHS: Record<Lang, string[]> = {
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** "2026-11-03" -> "3 Kasım 2026" / "November 3, 2026" (no Date parsing, so no timezone drift). */
export function formatDate(iso: string, lang: Lang = "tr"): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[lang][m - 1] ?? "";
  return lang === "en" ? `${month} ${d}, ${y}` : `${d} ${month} ${y}`;
}
