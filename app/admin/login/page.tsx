/* /admin/login — renders without Supabase (shows a config notice instead of a working form). */
import { Suspense } from "react";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginCard, type LoginNotice } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Giriş · SerdarOS 96 Admin", robots: { index: false, follow: false } };

const NOTICES: readonly LoginNotice[] = ["config", "not-admin"];

async function WithParams({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : "";
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  const notice = NOTICES.find((n) => n === err);
  return <LoginCard configured={isSupabaseConfigured()} notice={notice} next={next} />;
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Suspense fallback={<LoginCard configured={isSupabaseConfigured()} next="/admin" />}>
      <WithParams searchParams={searchParams} />
    </Suspense>
  );
}
