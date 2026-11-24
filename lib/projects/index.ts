/* Proje detayları. Data: Supabase (site_content "projects") with fallback lib/projects/<slug>(.en).ts. */
import type { ProjectDetails } from "./types";
import type { Lang } from "@/lib/i18n";
import { siteData } from "@/lib/site-data/store";

export type { ProjectDetails } from "./types";

export function projectDetails(lang: Lang, slug: string): ProjectDetails | undefined {
  return siteData().projects[lang].find((d) => d.slug === slug);
}
