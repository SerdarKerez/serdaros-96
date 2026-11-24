"use client";
/* SerdarOS 96 — language (TR / EN). Wrap the app in <LangProvider>; read it with useLang(). */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { storage } from "@/lib/storage";

export type Lang = "tr" | "en";
export const LANGS: Lang[] = ["tr", "en"];

/** A value available in both languages. */
export type L<T = string> = { tr: T; en: T };

export function pick<T>(lang: Lang, v: L<T>): T {
  return v[lang];
}

interface LangApi {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Inline translation: t("Kaydet", "Save"). */
  t: (tr: string, en: string) => string;
}

const LangContext = createContext<LangApi | null>(null);

function initialLang(): Lang {
  const saved = storage.get<string | null>("lang", null);
  if (saved === "tr" || saved === "en") return saved;
  if (typeof navigator !== "undefined" && !/^tr\b/i.test(navigator.language || "")) return "en";
  return "tr";
}

export function LangProvider({ children }: { children: ReactNode }) {
  // Only rendered client-side (SerdarOS mounts after hydration), so reading storage here is safe.
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    storage.set("lang", l);
    setLangState(l);
  }, []);
  const toggle = useCallback(() => setLang(lang === "tr" ? "en" : "tr"), [lang, setLang]);
  const t = useCallback((tr: string, en: string) => (lang === "tr" ? tr : en), [lang]);

  const api = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <LangContext.Provider value={api}>{children}</LangContext.Provider>;
}

export function useLang(): LangApi {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang() must be used inside <LangProvider>");
  return ctx;
}
