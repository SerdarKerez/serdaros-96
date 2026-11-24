/* Merge rows from Supabase over the defaults. Anything missing or malformed falls back, so a bad row
   can never blank the site. */
import type { SiteData, SiteKey } from "./types";
import { SITE_KEYS } from "./types";
import { DEFAULT_SITE_DATA } from "./defaults";

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep merge: objects merge key-by-key, arrays and primitives from `over` replace `base` when type-compatible. */
export function deepMerge<T>(base: T, over: Json): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (isObj(base)) {
    if (!isObj(over)) return base;
    const out: Record<string, Json> = { ...base };
    for (const k of Object.keys(over)) out[k] = k in base ? deepMerge((base as Record<string, Json>)[k], over[k]) : over[k];
    return out as T;
  }
  return (typeof over === typeof base ? over : base) as T;
}

const validLangArrays = (v: Json): boolean =>
  isObj(v) && Array.isArray(v.tr) && Array.isArray(v.en) && [...v.tr, ...v.en].every((x) => isObj(x) && typeof x.slug === "string");

export function mergeSiteData(rows: { key: string; data: Json }[] | null | undefined): SiteData {
  const out: SiteData = { ...DEFAULT_SITE_DATA };
  for (const row of rows ?? []) {
    const key = row.key as SiteKey;
    if (!SITE_KEYS.includes(key)) continue;
    if (key === "content" && isObj(row.data) && isObj(row.data.tr) && isObj(row.data.en)) {
      out.content = {
        tr: deepMerge(DEFAULT_SITE_DATA.content.tr, row.data.tr),
        en: deepMerge(DEFAULT_SITE_DATA.content.en, row.data.en),
      };
    } else if (key === "labels" && isObj(row.data)) {
      out.labels = deepMerge(DEFAULT_SITE_DATA.labels, row.data);
    } else if ((key === "blog" || key === "projects") && validLangArrays(row.data)) {
      out[key] = row.data as never;
    }
  }
  return out;
}
