"use client";
/* SerdarOS 96 admin panel: top bar, 5-group sidebar, stacked section cards, sticky save bar. Fully client-side. */
import { useEffect, useEffectEvent, useId, useMemo, useState, type ReactNode } from "react";
import { SITE_KEYS, type SiteData, type SiteKey } from "@/lib/site-data/types";
import { logout, saveSiteData, type ActionResult } from "@/app/admin/actions";
import { AdminLangProvider, LangSwitch, useAdminLang, type T } from "./i18n";
import { changedKeys, groupsFor, dirtyGroups, validate, type GroupId, type GroupProps } from "./model";
import { GeneralGroup } from "./groups/GeneralGroup";
import { TextsGroup } from "./groups/TextsGroup";
import { ProjectsGroup } from "./groups/ProjectsGroup";
import { BlogGroup } from "./groups/BlogGroup";
import { GalleryGroup } from "./groups/GalleryGroup";

/** Toast texts are functions of `t`, so an open toast follows a language switch. */
type Toast = { id: number; kind: "ok" | "error" | "info"; text: (t: T) => string; link?: boolean; action?: { label: (t: T) => string; run: () => void } };

function saveErrorText(res: Extract<ActionResult, { ok: false }>, t: T): string {
  switch (res.code) {
    case "auth-expired": return t("Oturum süresi doldu, tekrar giriş yap.", "Session expired, please sign in again.");
    case "forbidden": return t("Yetkin yok.", "You are not allowed to do this.");
    case "invalid": return t("Geçersiz veri: ", "Invalid data: ") + (res.detail ?? "");
    case "db": return t("Kaydedilemedi: ", "Could not save: ") + (res.detail ?? "");
  }
}

const VIEWS: Record<GroupId, (p: GroupProps) => ReactNode> = {
  general: GeneralGroup,
  texts: TextsGroup,
  projects: ProjectsGroup,
  blog: BlogGroup,
  gallery: GalleryGroup,
};

const NO_OPEN = new Set<number>();

type Props = { initial: SiteData; storedKeys: string[]; email: string; loadError?: string };

export default function AdminApp(props: Props) {
  return (
    <AdminLangProvider>
      <Editor {...props} />
    </AdminLangProvider>
  );
}

function Editor({ initial, storedKeys, email, loadError }: Props) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [stored, setStored] = useState(storedKeys);
  const [group, setGroup] = useState<GroupId>("general");
  const { lang, setLang, t } = useAdminLang();
  const GROUPS = useMemo(() => groupsFor(t), [t]);
  const [open, setOpenState] = useState<Record<"projects" | "blog", Set<number>>>({ projects: new Set(), blog: new Set() });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const selectId = useId();

  const dirty = useMemo(() => dirtyGroups(data, saved), [data, saved]);
  const errors = useMemo(() => validate(data, t), [data, t]);
  const needsSeed = SITE_KEYS.some((k) => !stored.includes(k));
  const isDirty = dirty.length > 0;

  const toast = (n: Omit<Toast, "id">, ms = 7000) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-3), { ...n, id }]);
    if (ms) window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), ms);
  };
  const dismiss = (id: number) => setToasts((ts) => ts.filter((x) => x.id !== id));

  const goToField = (e: (typeof errors)[number]) => {
    setGroup(e.group);
    setLang(e.lang);
    if (e.group === "projects" || e.group === "blog") {
      const g = e.group;
      setOpenState((o) => ({ ...o, [g]: new Set(o[g]).add(e.index) }));
    }
    window.setTimeout(() => {
      const el = document.getElementById(e.fieldId);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
    }, 80);
  };

  async function save() {
    if (saving) return;
    if (errors.length) {
      // Prefer an error in the current language: jumping to the other one also flips the UI language.
      const e = errors.find((x) => x.lang === lang) ?? errors[0];
      const more = errors.length - 1;
      toast({
        kind: "error",
        text: (t) => {
          const g = groupsFor(t).find((x) => x.id === e.group)!.label;
          // Re-validate so the field message follows the current UI language.
          const msg = validate(data, t).find((x) => x.fieldId === e.fieldId)?.message ?? e.message;
          return t(
            `Kaydedilemedi: ${g} (${e.lang.toUpperCase()}), ${e.index + 1}. öğe — ${msg}` + (more > 0 ? ` (+${more} hata daha)` : ""),
            `Not saved: ${g} (${e.lang.toUpperCase()}), item ${e.index + 1} — ${msg}` + (more > 0 ? ` (+${more} more error${more > 1 ? "s" : ""})` : ""),
          );
        },
        action: { label: (t) => t("Alana git", "Go to field"), run: () => goToField(e) },
      }, 10000);
      goToField(e);
      return;
    }
    const keys: SiteKey[] = needsSeed ? [...SITE_KEYS] : changedKeys(data, saved);
    if (keys.length === 0) return toast({ kind: "info", text: (t) => t("Kaydedilecek değişiklik yok.", "No changes to save.") }, 3000);
    const snapshot = data;
    setSaving(true);
    try {
      const res = await saveSiteData(snapshot, keys);
      if (res.ok) {
        setSaved(snapshot);
        setStored((s) => Array.from(new Set([...s, ...keys])));
        toast({ kind: "ok", text: (t) => t("Yayınlandı", "Published"), link: true });
      } else {
        toast({ kind: "error", text: (t) => saveErrorText(res, t) }, 10000);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : null;
      toast({ kind: "error", text: (t) => t("Kaydedilemedi: ", "Could not save: ") + (detail ?? t("bağlantı hatası", "connection error")) }, 10000);
    } finally {
      setSaving(false);
    }
  }

  const discard = () => {
    if (!window.confirm(t("Kaydedilmemiş tüm değişiklikler silinsin mi?", "Discard all unsaved changes?"))) return;
    setData(saved);
    setOpenState({ projects: new Set(), blog: new Set() });
    toast({ kind: "info", text: (t) => t("Değişiklikler geri alındı.", "Changes discarded.") }, 3000);
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      void save();
    }
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  const View = VIEWS[group];
  const openKey = group === "projects" || group === "blog" ? group : null;
  const groupErrors = (g: GroupId) => errors.filter((e) => e.group === g).length;
  const current = GROUPS.find((g) => g.id === group)!;

  return (
    <div className="adm-app">
      <header className="adm-top">
        <div className="adm-top__brand">
          <span className="adm-logo" aria-hidden="true" />
          <span>SerdarOS 96 · <b>Admin</b></span>
        </div>
        <LangSwitch label={t("Dil (arayüz ve düzenlenen içerik)", "Language (interface and edited content)")} />
        <div className="adm-top__right">
          <span className="adm-top__email" title={email}>{email}</span>
          <a className="adm-btn adm-btn--ghost adm-btn--small" href="/" target="_blank" rel="noopener noreferrer">{t("Siteyi görüntüle ↗", "View site ↗")}</a>
          <form
            action={logout}
            onSubmit={(e) => {
              if (isDirty && !window.confirm(t("Kaydedilmemiş değişiklikler var. Yine de çıkılsın mı?", "You have unsaved changes. Sign out anyway?"))) e.preventDefault();
            }}
          >
            <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">{t("Çıkış", "Sign out")}</button>
          </form>
        </div>
      </header>

      <nav className="adm-side" aria-label={t("Bölümler", "Sections")}>
        <ul>
          {GROUPS.map((g) => {
            const errs = groupErrors(g.id);
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className="adm-side__item"
                  aria-current={group === g.id ? "page" : undefined}
                  onClick={() => setGroup(g.id)}
                >
                  <span className="adm-side__label">
                    {g.label}
                    {dirty.includes(g.id) && <span className="adm-dot" aria-label={t("kaydedilmemiş değişiklik", "unsaved changes")} />}
                    {errs > 0 && <span className="adm-side__err" aria-label={t(`${errs} hata`, `${errs} error${errs > 1 ? "s" : ""}`)}>{errs}</span>}
                  </span>
                  <span className="adm-side__hint">{g.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="adm-side__foot">{t("Kısayol:", "Shortcut:")} <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>S</kbd> {t("kaydeder.", "saves.")}</p>
      </nav>

      <main className="adm-main">
        <div className="adm-mobnav">
          <label htmlFor={selectId} className="adm-field__label">{t("Bölüm", "Section")}</label>
          <select id={selectId} className="adm-input adm-select" value={group} onChange={(e) => setGroup(e.target.value as GroupId)}>
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}{dirty.includes(g.id) ? " •" : ""}{groupErrors(g.id) ? " ⚠" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-pagehead">
          <h1>{current.label}</h1>
          <p>
            {current.hint} · {t("Düzenlenen dil:", "Editing language:")} <b>{lang === "tr" ? "Türkçe" : "English"}</b>
            {group === "general" && t(" (isim tablosu iki dili birlikte gösterir)", " (the names table shows both languages)")}
          </p>
        </div>

        {loadError && (
          <div className="adm-banner adm-banner--error" role="alert">
            {t("Veritabanı okunamadı, yerleşik içerik gösteriliyor: ", "Could not read the database, showing built-in content: ")}{loadError}
          </div>
        )}
        {needsSeed && !loadError && (
          <div className="adm-banner" role="status">
            {t("Veritabanı boş – ilk kayıtta mevcut içerik yüklenecek.", "Database is empty – the current content will be uploaded on the first save.")}
          </div>
        )}

        <div className="adm-stack">
          <View
            data={data}
            lang={lang}
            update={(fn) => setData((d) => fn(d))}
            errors={errors}
            open={openKey ? open[openKey] : NO_OPEN}
            setOpen={(fn) => { if (openKey) setOpenState((o) => ({ ...o, [openKey]: fn(o[openKey]) })); }}
          />
        </div>
      </main>

      <footer className={"adm-savebar" + (isDirty ? " adm-savebar--dirty" : "")}>
        <div className="adm-savebar__status" aria-live="polite">
          {isDirty ? (
            <>
              <span className="adm-dot" aria-hidden="true" />
              <span>{t(`Kaydedilmemiş değişiklik · ${dirty.length} bölüm`, `Unsaved changes · ${dirty.length} section${dirty.length > 1 ? "s" : ""}`)}</span>
            </>
          ) : needsSeed ? (
            <span className="adm-muted">{t("Henüz veritabanına kaydedilmedi", "Not saved to the database yet")}</span>
          ) : (
            <span className="adm-muted">{t("Tüm değişiklikler kaydedildi", "All changes saved")}</span>
          )}
          {errors.length > 0 && <span className="adm-savebar__err">⚠ {t(`${errors.length} hata`, `${errors.length} error${errors.length > 1 ? "s" : ""}`)}</span>}
        </div>
        <div className="adm-savebar__actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={discard} disabled={!isDirty || saving}>{t("Geri al", "Discard")}</button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => void save()} disabled={saving || (!isDirty && !needsSeed)}>
            {saving ? t("Kaydediliyor…", "Saving…") : t("Değişiklikleri Kaydet / Yayınla", "Save changes / Publish")}
          </button>
        </div>
      </footer>

      <div className="adm-toasts" aria-live="assertive">
        {toasts.map((x) => (
          <div key={x.id} className={"adm-toast adm-toast--" + x.kind} role={x.kind === "error" ? "alert" : "status"}>
            <span>{x.text(t)}</span>
            {x.link && <a href="/" target="_blank" rel="noopener noreferrer">{t("Siteyi aç ↗", "Open site ↗")}</a>}
            {x.action && <button type="button" className="adm-toast__action" onClick={() => { x.action!.run(); dismiss(x.id); }}>{x.action.label(t)}</button>}
            <button type="button" className="adm-toast__close" aria-label={t("Bildirimi kapat", "Close notification")} onClick={() => dismiss(x.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
