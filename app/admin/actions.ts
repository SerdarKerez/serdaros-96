"use server";
/* Admin server actions. Each one re-checks the session and admin role; RLS enforces it again in Postgres. */
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkAdmin } from "@/lib/admin/auth";
import { SITE_TAG } from "@/lib/site-data/server";
import { SITE_KEYS, type SiteData } from "@/lib/site-data/types";

/** Stable error codes; the admin UI translates them (TR/EN). `detail` carries raw technical info when useful. */
export type SaveErrorCode = "auth-expired" | "forbidden" | "invalid" | "db";
export type ActionResult = { ok: true; savedAt: string } | { ok: false; code: SaveErrorCode; detail?: string };
export type LoginErrorCode = "missing" | "bad-credentials" | "not-admin";
export type LoginState = { error?: LoginErrorCode } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "missing" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "bad-credentials" };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "not-admin" };
  }
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Saves the whole editable site (4 JSONB rows) and purges the public cache. */
export async function saveSiteData(data: SiteData, keys: readonly string[] = SITE_KEYS): Promise<ActionResult> {
  const auth = await checkAdmin();
  if (!auth.ok) return { ok: false, code: auth.reason === "anon" ? "auth-expired" : "forbidden" };

  const toSave = SITE_KEYS.filter((k) => keys.includes(k));
  for (const k of toSave) {
    if (data?.[k] == null || typeof data[k] !== "object") return { ok: false, code: "invalid", detail: k };
  }
  const now = new Date().toISOString();
  const rows = toSave.map((key) => ({ key, data: data[key], updated_at: now, updated_by: auth.user.id }));

  const supabase = await createClient();
  const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, code: "db", detail: error.message };

  updateTag(SITE_TAG); // next request waits for fresh data (read-your-own-writes)
  revalidatePath("/", "layout");
  return { ok: true, savedAt: now };
}
