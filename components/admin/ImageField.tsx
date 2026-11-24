"use client";
/* Image picker: thumbnail + upload to Supabase Storage (bucket "media") + manual URL / path input. */
import { useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, isSupabaseConfigured } from "@/lib/supabase/env";
import { useAdminLang } from "./i18n";

const MAX_BYTES = 10 * 1024 * 1024;

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return ext ? `${base}.${ext}` : base;
}

type Status = { kind: "idle" } | { kind: "uploading"; name: string } | { kind: "error"; message: string } | { kind: "done" };

export function ImageField({
  label, value, onChange, id, shared, compact,
}: { label: string; value: string; onChange: (v: string) => void; id?: string; shared?: boolean; compact?: boolean }) {
  const auto = useId();
  const inputId = id ?? auto;
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [broken, setBroken] = useState<string | null>(null);
  const { t } = useAdminLang();

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return setStatus({ kind: "error", message: t("Yalnızca görsel dosyaları yüklenebilir.", "Only image files can be uploaded.") });
    if (file.size > MAX_BYTES) return setStatus({ kind: "error", message: t(`Dosya çok büyük (${(file.size / 1048576).toFixed(1)} MB). En fazla 10 MB.`, `File is too large (${(file.size / 1048576).toFixed(1)} MB). Max 10 MB.`) });
    if (!isSupabaseConfigured()) return setStatus({ kind: "error", message: t("Supabase ayarlı değil: yükleme yapılamıyor.", "Supabase is not configured: uploads are unavailable.") });
    setStatus({ kind: "uploading", name: file.name });
    try {
      const path = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const storage = createClient().storage.from(MEDIA_BUCKET);
      const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);
      onChange(storage.getPublicUrl(path).data.publicUrl);
      setStatus({ kind: "done" });
    } catch (e) {
      setStatus({ kind: "error", message: t("Yükleme başarısız: ", "Upload failed: ") + (e instanceof Error ? e.message : String(e)) });
    }
  }

  const uploading = status.kind === "uploading";
  return (
    <div className={"adm-field adm-image" + (compact ? " adm-image--compact" : " adm-field--wide")}>
      <label className="adm-field__label" htmlFor={inputId}>
        {label}
        {shared && <span className="adm-chip" title={t("Bu alan TR ve EN için ortaktır", "This field is shared by TR and EN")}>TR+EN</span>}
      </label>
      <div className="adm-image__row">
        <div className="adm-image__thumb" aria-hidden="true">
          {value && broken !== value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" onError={() => setBroken(value)} />
          ) : (
            <span>{value ? t("önizleme yok", "no preview") : t("görsel yok", "no image")}</span>
          )}
        </div>
        <div className="adm-image__controls">
          <input
            id={inputId}
            className="adm-input adm-input--mono"
            type="text"
            value={value}
            placeholder={t("https://… veya /yol/gorsel.jpg", "https://… or /path/image.jpg")}
            onChange={(e) => { onChange(e.target.value); setStatus({ kind: "idle" }); }}
          />
          <div className="adm-image__actions">
            <button type="button" className="adm-btn adm-btn--small" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? t("Yükleniyor…", "Uploading…") : t("Yükle", "Upload")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              aria-label={label + t(": dosya seç", ": choose file")}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f);
              }}
            />
            {value && (
              <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" onClick={() => onChange("")} disabled={uploading}>
                {t("Kaldır", "Remove")}
              </button>
            )}
          </div>
          <div aria-live="polite">
            {uploading && (
              <div className="adm-progress" role="progressbar" aria-label={t(`${status.name} yükleniyor`, `Uploading ${status.name}`)}>
                <span />
              </div>
            )}
            {status.kind === "error" && <p className="adm-field__error">{status.message}</p>}
            {status.kind === "done" && <p className="adm-field__ok">{t("Yüklendi.", "Uploaded.")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
