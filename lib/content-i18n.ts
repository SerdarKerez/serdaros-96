/* Language-aware access to site content. Data: Supabase (site_content "content") with fallback
   TR lib/content.ts / EN lib/content.en.ts (same shape). */
import type { Content } from "./content";
import type { Lang } from "./i18n";
import { siteData } from "./site-data/store";

export function getContent(lang: Lang): Content {
  return siteData().content[lang];
}
