/* Layer 2 auth: every admin page and server action calls requireAdmin(). */
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminCheck = { ok: true; user: User } | { ok: false; reason: "config" | "anon" | "not-admin" };

export async function checkAdmin(): Promise<AdminCheck> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "config" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "anon" };
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { ok: false, reason: "not-admin" };
  return { ok: true, user };
}

/** For pages: redirects to the login screen unless the user is an admin. */
export async function requireAdmin(): Promise<User> {
  const res = await checkAdmin();
  if (!res.ok) redirect("/admin/login" + (res.reason === "anon" ? "" : "?error=" + res.reason));
  return res.user;
}
