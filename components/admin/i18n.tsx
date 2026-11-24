"use client";
/*
 * Admin UI language (TR/EN). One switch drives both the admin chrome and the edited content language.
 * The choice is kept in localStorage; the server snapshot is always "tr", so hydration never mismatches
 * and the stored language is applied right after mount.
 */
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

export type T = (tr: string, en: string) => string;

const STORAGE_KEY = "serdaros-admin-lang";
const EVENT = "serdaros-admin-lang";
let memory: Lang = "tr"; // fallback when storage is blocked

function read(): Lang {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "tr" || v === "en") return v;
  } catch {
    /* storage unavailable */
  }
  return memory;
}

function write(l: Lang) {
  memory = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) cb(); };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: T };

const AdminLangContext = createContext<Ctx | null>(null);

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, read, () => "tr" as Lang);
  const setLang = useCallback((l: Lang) => write(l), []);
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (tr, en) => (lang === "en" ? en : tr) }), [lang, setLang]);
  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>;
}

export function useAdminLang(): Ctx {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useAdminLang must be used inside <AdminLangProvider>");
  return ctx;
}

/** Small TR | EN segmented switch bound to the admin language. */
export function LangSwitch({ label }: { label?: string }) {
  const { lang, setLang, t } = useAdminLang();
  return (
    <div className="adm-seg" role="group" aria-label={label ?? t("Dil", "Language")}>
      {(["tr", "en"] as Lang[]).map((l) => (
        <button key={l} type="button" className="adm-seg__btn" aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
