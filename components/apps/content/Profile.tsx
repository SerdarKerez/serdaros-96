"use client";
/* Guest profile. App: profile. Saves via useOS().setProfile({name, avatar}). */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { useLang } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { AVATAR_KEYS, AVATAR_LABELS, avatarSvg, isAvatar } from "./avatars";
import { SvgSpan } from "./shared";

export default function Profile({ winId, close }: AppProps) {
  const os = useOS();
  const { lang, t } = useLang();
  const O = getContent(lang).owner;
  const first = O.shortName || "Serdar";
  const osName = O.os || "SerdarOS 96";
  const [avatar, setAvatar] = useState<string>(() => (isAvatar(os.profile.avatar) ? os.profile.avatar : AVATAR_KEYS[0]));
  const [name, setName] = useState<string>(() => (os.profile.saved ? os.profile.name : ""));
  const [confirming, setConfirming] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => { try { nameRef.current?.focus({ preventScroll: true }); } catch { /* ignore */ } }, 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (confirming) confirmRef.current?.querySelector("button")?.focus();
    else resetBtnRef.current?.focus();
  }, [confirming]);

  function save() {
    const n = name.trim().slice(0, 24) || t("Misafir", "Guest");
    os.setProfile({ name: n, avatar });
    os.notify(t("Hoş geldin, " + n + "! Profilin kaydedildi.", "Welcome, " + n + "! Your profile has been saved."));
    close();
  }

  function resetAll() {
    storage.clearAll();
    os.notify(t("Profil sıfırlandı. Temiz bir başlangıç!", "Profile reset. A fresh start!"));
    // Not cleared on unmount on purpose: restart() unmounts this window.
    setTimeout(() => os.restart(), 400);
  }

  const nameId = "guest-name-" + winId;
  const group = "avatar-" + winId;

  return (
    <div className="guest-profile">
      <div className="guest-profile__intro">
        <p className="guest-profile__eyebrow">{t("SerdarOS'ta küçük bir köşe", "A little corner of SerdarOS")}</p>
        <h3>{t("Kendini evinde hisset.", "Make yourself at home.")}</h3>
        <p>{t("Bir avatar seç, adını bırak. " + first + "'ın bilgisayarında misafirsin.", "Pick an avatar and leave your name. You're a guest on " + first + "'s computer.")}</p>
      </div>
      <div className="guest-profile__preview" aria-live="polite">
        <SvgSpan className="guest-profile__portrait" svg={avatarSvg(avatar)} />
        <div className="guest-profile__identity">
          <span className="guest-profile__preview-label">{t("Misafir kartı", "Guest pass")}</span>
          <strong>{name.trim() || t("Misafir", "Guest")}</strong>
          <span>{"Guest on " + osName}</span>
        </div>
        <span className="guest-profile__pass-number" aria-hidden="true">96</span>
      </div>

      <fieldset className="guest-profile__cats">
        <legend>{t("Avatarını seç", "Choose your avatar")}</legend>
        <div className="guest-profile__cat-grid">
          {AVATAR_KEYS.map((k) => (
            <label key={k} className="guest-profile__cat-option">
              <input type="radio" name={group} value={k} checked={k === avatar} onChange={() => setAvatar(k)} />
              <span className="guest-profile__cat-tile">
                <SvgSpan svg={avatarSvg(k)} />
                {AVATAR_LABELS[k]?.[lang] || k}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="guest-profile__name">
        <label htmlFor={nameId}>{t("Adın", "Your name")}</label>
        <input
          ref={nameRef}
          id={nameId}
          type="text"
          maxLength={24}
          placeholder={t("Misafir", "Guest")}
          autoComplete="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }}
        />
        <p>{t("Start menüsünde ve karşılama ekranında bu adı göreceksin.", "You'll see this name in the start menu and on the welcome screen.")}</p>
      </div>

      <div className="guest-profile__actions">
        <span>{t("Bu cihazda hatırlanır.", "Remembered on this device.")}</span>
        <button type="button" onClick={close}>{t("Belki sonra", "Maybe later")}</button>
        <button type="button" className="guest-profile__save" onClick={save}>{t("Kaydet ve devam et →", "Save and continue →")}</button>
      </div>

      <div className="guest-profile__reset">
        <div className="guest-profile__reset-heading">
          <div>
            <strong>{t("Temiz bir başlangıç?", "A fresh start?")}</strong>
            <p>{t("Tüm misafir verilerini bu tarayıcıdan sil.", "Delete all guest data from this browser.")}</p>
          </div>
          <button type="button" ref={resetBtnRef} onClick={() => setConfirming(true)}>{t("Profili sıfırla…", "Reset profile…")}</button>
        </div>
        <div className="guest-profile__reset-confirmation" role="alertdialog" hidden={!confirming} ref={confirmRef}>
          <h4>{t("Her şey sıfırlansın mı?", "Reset everything?")}</h4>
          <p>
            {t(
              "Misafir profilin, notların, mesaj taslağın ve oyun skorların bu cihazdan silinecek. Bu işlem geri alınamaz.",
              "Your guest profile, notes, message draft and game scores will be deleted from this device. This can't be undone.",
            )}
          </p>
          <div className="guest-profile__reset-actions">
            <button type="button" onClick={() => setConfirming(false)}>{t("Profilimi koru", "Keep my profile")}</button>
            <button type="button" className="guest-profile__reset-confirm" onClick={resetAll}>{t("Evet, her şeyi sıfırla", "Yes, reset everything")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
