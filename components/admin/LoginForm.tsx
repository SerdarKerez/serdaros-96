"use client";
/* Admin login card + form (useActionState + login server action). Texts follow the admin TR/EN switch. */
import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginErrorCode, type LoginState } from "@/app/admin/actions";
import { AdminLangProvider, LangSwitch, useAdminLang, type T } from "./i18n";

export type LoginNotice = "config" | "not-admin";

function noticeText(n: LoginNotice, t: T): string {
  return n === "config"
    ? t(
        "Supabase ayarlı değil: .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekleyip sunucuyu yeniden başlat.",
        "Supabase is not configured: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server.",
      )
    : t("Bu hesabın admin yetkisi yok. Farklı bir hesapla giriş yap.", "This account has no admin rights. Sign in with a different account.");
}

function errorText(code: LoginErrorCode, t: T): string {
  switch (code) {
    case "missing": return t("E-posta ve şifre gerekli.", "Email and password are required.");
    case "bad-credentials": return t("Giriş başarısız: e-posta veya şifre hatalı.", "Sign-in failed: wrong email or password.");
    case "not-admin": return t("Bu hesabın admin yetkisi yok.", "This account has no admin rights.");
  }
}

export default function LoginForm({ next, disabled }: { next: string; disabled?: boolean }) {
  const { t } = useAdminLang();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="adm-login__form">
      <input type="hidden" name="next" value={next} />
      <div className="adm-field">
        <label className="adm-field__label" htmlFor="login-email">{t("E-posta", "Email")}</label>
        <input id="login-email" className="adm-input" type="email" name="email" autoComplete="username" required disabled={disabled} />
      </div>
      <div className="adm-field">
        <label className="adm-field__label" htmlFor="login-password">{t("Şifre", "Password")}</label>
        <input id="login-password" className="adm-input" type="password" name="password" autoComplete="current-password" required disabled={disabled} />
      </div>
      <p className="adm-login__error" role="alert" aria-live="polite">{state?.error ? errorText(state.error, t) : ""}</p>
      <button type="submit" className="adm-btn adm-btn--primary adm-login__submit" disabled={pending || disabled}>
        {pending ? t("Giriş yapılıyor…", "Signing in…") : t("Giriş yap", "Sign in")}
      </button>
    </form>
  );
}

function Card({ configured, notice, next }: { configured: boolean; notice?: LoginNotice; next: string }) {
  const { t } = useAdminLang();
  const shown = configured ? notice : "config";
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__titlebar">
          <span className="adm-logo" aria-hidden="true" />
          <span>SerdarOS 96 · Admin</span>
          <span className="adm-login__lang">
            <LangSwitch label={t("Arayüz dili", "Interface language")} />
          </span>
        </div>
        <div className="adm-login__body">
          <h1 className="adm-login__title">{t("Yönetim paneline giriş", "Sign in to the admin panel")}</h1>
          <p className="adm-muted">{t("Site içeriğini düzenlemek için admin hesabınla giriş yap.", "Sign in with your admin account to edit the site content.")}</p>
          {shown && (
            <div className={"adm-banner" + (configured ? " adm-banner--error" : " adm-banner--warn")} role="alert">
              {noticeText(shown, t)}
            </div>
          )}
          <LoginForm next={next} disabled={!configured} />
          <Link className="adm-login__back" href="/">{t("← Siteye dön", "← Back to site")}</Link>
        </div>
      </div>
    </main>
  );
}

/** The whole login card, wrapped in its own language provider (same storage key as the panel). */
export function LoginCard(props: { configured: boolean; notice?: LoginNotice; next: string }) {
  return (
    <AdminLangProvider>
      <Card {...props} />
    </AdminLangProvider>
  );
}

/** Suspense fallback for /admin, in the stored admin language. */
export function AdminLoading() {
  return (
    <AdminLangProvider>
      <LoadingText />
    </AdminLangProvider>
  );
}

function LoadingText() {
  const { t } = useAdminLang();
  return <div className="adm-loading" role="status">{t("Panel yükleniyor…", "Loading panel…")}</div>;
}
