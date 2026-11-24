"use client";
/* SerdarMail contact form (mailto:, no backend). App: mail. */
import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import type { AppProps } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { pick, useLang, type L } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { iconSvg, SvgSpan } from "./shared";

/* Simple monochrome logo glyphs (24x24, currentColor). */
const LOGOS: Record<string, string> = {
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.84-2.06 3.8-2.06 4.05 0 4.8 2.67 4.8 6.14v5.82h-4v-5.16c0-1.23-.02-2.82-1.72-2.82-1.72 0-1.98 1.34-1.98 2.73v5.25h-4V9.75Z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3.5 6 8.5 7 8.5-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};
const MAX = { name: 80, email: 254, subject: 120, message: 5000 };
const DRAFT_KEY = "mail-draft";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Key = "name" | "email" | "subject" | "message";
type Values = Record<Key, string>;
const KEYS: Key[] = ["name", "email", "subject", "message"];
const EMPTY: Values = { name: "", email: "", subject: "", message: "" };
type Errors = Record<Key, L | null>;
const NO_ERRORS: Errors = { name: null, email: null, subject: null, message: null };

export default function Mail({ winId }: AppProps) {
  const os = useOS();
  const { lang, t: tr } = useLang();
  const O = getContent(lang).owner;
  const first = O.shortName || String(O.name || "Serdar").split(" ")[0];
  const [values, setValues] = useState<Values>(() => {
    const d = storage.get<Partial<Values> | null>(DRAFT_KEY, null) || {};
    return { name: d.name || "", email: d.email || "", subject: d.subject || "", message: d.message || "" };
  });
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [statusOverride, setStatusOverride] = useState<L | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const refs = useRef<Partial<Record<Key, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  // Focus a field after the next paint (the field may only render after this state update).
  const setFocusAfter = (key: Key) => {
    requestAnimationFrame(() => refs.current[key]?.focus());
  };

  const trimmed = (v: Values): Values => ({
    name: v.name.trim(), email: v.email.trim(), subject: v.subject.trim(), message: v.message.trim(),
  });

  const t = trimmed(values);
  const readyStatus = t.name && EMAIL_RE.test(t.email) && t.message ? tr("Gönderime hazır", "Ready to send") : tr("Taslak", "Draft");
  const status = statusOverride ? pick(lang, statusOverride) : readyStatus;

  function onInput(k: Key, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (errors[k]) setErrors({ ...errors, [k]: null });
    storage.set(DRAFT_KEY, trimmed(next));
    setStatusOverride(null);
  }

  function validate(): Errors {
    const v = trimmed(values);
    return {
      name: v.name ? null : { tr: "Lütfen adını yaz.", en: "Please enter your name." },
      email: !v.email
        ? { tr: "Lütfen e-posta adresini yaz.", en: "Please enter your email address." }
        : !EMAIL_RE.test(v.email)
          ? { tr: "Bu e-posta adresi geçerli görünmüyor.", en: "That email address doesn't look valid." }
          : null,
      subject: null,
      message: v.message ? null : { tr: "Mesaj boş olamaz.", en: "The message can't be empty." },
    };
  }

  function clearDraft() {
    setValues(EMPTY);
    setErrors(NO_ERRORS);
    storage.set(DRAFT_KEY, null);
    setStatusOverride(null);
  }

  function send() {
    const errs = validate();
    setErrors(errs);
    const bad = KEYS.find((k) => errs[k]);
    if (bad) {
      setStatusOverride({ tr: "Eksik alanlar var", en: "Some fields are missing" });
      setFocusAfter(bad);
      return;
    }
    const v = trimmed(values);
    const subject = v.subject || tr("SerdarOS 96 üzerinden mesaj", "Message via SerdarOS 96");
    const text =
      v.message + "\n\n— " + v.name + " <" + v.email + ">\n" + tr("(SerdarOS 96 · SerdarMail ile gönderildi)", "(Sent with SerdarOS 96 · SerdarMail)");
    const href = "mailto:" + String(O.email || "").trim() + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    const a = document.createElement("a");
    a.href = href;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    storage.set(DRAFT_KEY, null);
    setSentTo(v.email);
    setStatusOverride({ tr: "Mesaj e-posta uygulamasına aktarıldı", en: "Message handed over to your email app" });
  }

  function newMessage() {
    setSentTo(null);
    clearDraft();
    setFocusAfter("name");
  }

  function field(key: Key | "to", label: string, attrs: InputHTMLAttributes<HTMLInputElement>) {
    const id = "mail-" + key + "-" + winId;
    const isTo = key === "to";
    const e = isTo ? null : errors[key];
    const err = e ? pick(lang, e) : "";
    return (
      <div className="email-app__field">
        <label htmlFor={id}>{label}</label>
        <div className="email-app__input-wrap">
          {isTo ? (
            <input id={id} name="to" aria-describedby={id + "-err"} readOnly value={O.name || first} tabIndex={-1} />
          ) : (
            <input
              id={id}
              name={key}
              maxLength={MAX[key]}
              aria-describedby={id + "-err"}
              aria-invalid={err ? "true" : "false"}
              ref={(el) => { refs.current[key] = el; }}
              value={values[key]}
              onChange={(e) => onInput(key, e)}
              {...attrs}
            />
          )}
          <span className="email-app__field-error" id={id + "-err"} hidden={!err}>{err}</span>
        </div>
      </div>
    );
  }

  const links: { key: string; label: string; href: string }[] = [];
  if (O.github) links.push({ key: "github", label: "GitHub", href: O.github });
  if (O.instagram) links.push({ key: "instagram", label: "Instagram", href: O.instagram });
  if (O.linkedin) links.push({ key: "linkedin", label: "LinkedIn", href: O.linkedin });
  const msgId = "mail-message-" + winId;
  const formId = "mail-form-" + winId;

  return (
    <div className="email-app">
      <div className="email-app__toolbar" hidden={sentTo != null}>
        <span className="email-app__brand">
          <SvgSpan className="email-app__brand-icon" svg={iconSvg("mail")} />
          SerdarMail <small>96</small>
        </span>
        <button type="submit" className="email-app__send" form={formId}>{tr("Mesajı gönder", "Send message")}</button>
        <button type="button" onClick={clearDraft}>{tr("Taslağı temizle", "Clear draft")}</button>
      </div>

      <div className="email-app__main">
        {sentTo == null ? (
          <form className="email-app__form" id={formId} noValidate onSubmit={(e) => { e.preventDefault(); send(); }}>
            <div className="email-app__intro">
              <span>{tr("Yeni mesaj", "New message")}</span>
              <p>{tr("Küçük bir merhaba, bir proje fikri ya da aklındaki herhangi bir şey.", "A quick hello, a project idea or anything on your mind.")}</p>
            </div>
            <fieldset className="email-app__fields">
              <legend className="sr-only">{tr("Mesaj bilgileri", "Message details")}</legend>
              {field("to", tr("Kime", "To"), {})}
              {field("name", tr("Adın", "Your name"), { autoComplete: "name", placeholder: tr("Adın soyadın", "Your full name") })}
              {field("email", tr("E-postan", "Your email"), { type: "email", autoComplete: "email", placeholder: tr("sen@ornek.com", "you@example.com") })}
              {field("subject", tr("Konu", "Subject"), { placeholder: tr("Merhaba!", "Hello!") })}
              <div className="email-app__message">
                <label htmlFor={msgId}>
                  {tr("Mesaj", "Message")}<span>{values.message.length + " / " + MAX.message}</span>
                </label>
                <textarea
                  id={msgId}
                  name="message"
                  maxLength={MAX.message}
                  placeholder={tr("Merhaba " + first + "…", "Hi " + first + "…")}
                  aria-describedby={msgId + "-err"}
                  aria-invalid={errors.message ? "true" : "false"}
                  ref={(el) => { refs.current.message = el; }}
                  value={values.message}
                  onChange={(e) => onInput("message", e)}
                />
                <span className="email-app__field-error" id={msgId + "-err"} hidden={!errors.message}>{errors.message ? pick(lang, errors.message) : ""}</span>
              </div>
            </fieldset>
            {links.length > 0 && (
              <div className="email-app__links">
                <span>{tr("Bana ulaş:", "Find me at:")}</span>
                {O.email && (
                  <a href={"mailto:" + O.email} className="email-app__link email-app__link--mail" title={O.email}>
                    <SvgSpan className="email-app__link-logo" svg={LOGOS.mail} />
                    {O.email}
                  </a>
                )}
                {links.map((l) => (
                  <a
                    key={l.key}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={"email-app__link email-app__link--" + l.key}
                    title={l.href}
                  >
                    <SvgSpan className="email-app__link-logo" svg={LOGOS[l.key]} />
                    {l.label}
                  </a>
                ))}
              </div>
            )}
            <p className="email-app__privacy">
              {tr(
                "Gönder'e basınca e-posta uygulaman hazır bir mesajla açılır; bu site hiçbir veriyi sunucuya göndermez. ",
                "When you press Send, your email app opens with the message ready; this site never sends any data to a server. ",
              )}
              <button type="button" className="email-app__privacy-link" onClick={() => os.openApp("privacy")}>Privacy.txt</button>
            </p>
          </form>
        ) : (
          <div className="email-app__sent" role="status">
            <SvgSpan className="email-app__sent-icon" hidden svg={iconSvg("mail")} />
            <p className="email-app__eyebrow">{tr("Giden posta hazır!", "Outgoing mail ready!")}</p>
            <h3>{tr("Mesaj hazırlandı", "Message prepared")}</h3>
            <p>
              {tr(
                "E-posta uygulamanda göndermeyi tamamla. " + first + " sana " + sentTo + " adresinden dönebilir.",
                "Finish sending it in your email app. " + first + " can get back to you at " + sentTo + ".",
              )}
            </p>
            <p className="email-app__fallback">
              {tr("Uygulama açılmadıysa doğrudan yaz: ", "If the app didn't open, write directly: ")}
              <a href={"mailto:" + (O.email || "")}>{O.email || ""}</a>
            </p>
            <button type="button" onClick={newMessage}>{tr("Yeni mesaj yaz", "Write a new message")}</button>
          </div>
        )}
      </div>

      <div className="email-app__status">
        <span>{status}</span>
        <span>SerdarOS Post Office</span>
      </div>
    </div>
  );
}
