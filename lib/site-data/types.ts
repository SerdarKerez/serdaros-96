/* Whole editable site, stored in Supabase table public.site_content as one JSONB row per key. */
import type { Content } from "@/lib/content";
import type { BlogPost } from "@/lib/blog/types";
import type { ProjectDetails } from "@/lib/projects/types";
import type { L, Lang } from "@/lib/i18n";

export type ByLang<T> = Record<Lang, T>;

export interface SiteData {
  content: ByLang<Content>;          // owner/contact, desktop, files (About, Welcome…), projects cards, folders, gallery
  labels: Record<string, L>;         // folder / file / app names
  blog: ByLang<BlogPost[]>;
  projects: ByLang<ProjectDetails[]>; // long-form project pages
}

export const SITE_KEYS = ["content", "labels", "blog", "projects"] as const;
export type SiteKey = (typeof SITE_KEYS)[number];
