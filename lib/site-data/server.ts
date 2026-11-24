/* Server-side site data: cached public read (tag "site-content") + uncached admin read. */
import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_DATA } from "./defaults";
import { mergeSiteData } from "./merge";
import type { SiteData } from "./types";

export const SITE_TAG = "site-content";

type Row = { key: string; data: unknown };

// Throws on error so failures are not cached; callers fall back to defaults.
const readRowsCached = unstable_cache(
  async (): Promise<Row[]> => {
    const { data, error } = await createPublicClient().from("site_content").select("key, data");
    if (error) throw new Error(error.message);
    return (data ?? []) as Row[];
  },
  ["site-content-rows-v1"],
  { tags: [SITE_TAG], revalidate: 3600 },
);

/** Public site: cached, never throws. */
export async function getSiteData(): Promise<SiteData> {
  if (!isSupabaseConfigured()) return DEFAULT_SITE_DATA;
  try {
    return mergeSiteData(await readRowsCached());
  } catch (e) {
    console.error("[site-data] Supabase read failed, using built-in content:", e);
    return DEFAULT_SITE_DATA;
  }
}

/** Admin panel: fresh read with the user session; also reports which keys exist in the DB. */
export async function getSiteDataForAdmin(): Promise<{ data: SiteData; storedKeys: string[]; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_content").select("key, data");
  if (error) return { data: DEFAULT_SITE_DATA, storedKeys: [], error: error.message };
  const rows = (data ?? []) as Row[];
  return { data: mergeSiteData(rows), storedKeys: rows.map((r) => r.key) };
}
