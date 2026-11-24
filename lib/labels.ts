/* Folder / file / app names shown on the desktop, start menu, folders, taskbar and window titles.
   Data: Supabase (site_content "labels") with fallback lib/site-data/default-labels.ts. */
import type { Lang } from "./i18n";
import { siteData } from "./site-data/store";
import { DEFAULT_LABELS } from "./site-data/default-labels";

export { DEFAULT_LABELS as LABELS };

export function label(id: string, lang: Lang): string | undefined {
  return siteData().labels[id]?.[lang] || DEFAULT_LABELS[id]?.[lang];
}
