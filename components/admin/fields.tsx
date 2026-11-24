"use client";
/* Small form primitives for the admin panel. Every input gets a visible <label>. */
import { useId, useState, type ReactNode } from "react";
import { useAdminLang } from "./i18n";

export function Section({ title, desc, actions, children }: { title: string; desc?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="adm-card">
      <header className="adm-card__head">
        <div>
          <h2 className="adm-card__title">{title}</h2>
          {desc && <p className="adm-card__desc">{desc}</p>}
        </div>
        {actions && <div className="adm-card__actions">{actions}</div>}
      </header>
      <div className="adm-card__body">{children}</div>
    </section>
  );
}

type Common = {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  /** Shown as a small chip: the value is shared by TR and EN. */
  shared?: boolean;
  wide?: boolean;
};

function Wrap({ label, id, hint, error, shared, wide, children }: Common & { id: string; children: ReactNode }) {
  const { t } = useAdminLang();
  return (
    <div className={"adm-field" + (wide ? " adm-field--wide" : "") + (error ? " adm-field--error" : "")}>
      <label className="adm-field__label" htmlFor={id}>
        {label}
        {shared && <span className="adm-chip" title={t("Bu alan TR ve EN için ortaktır", "This field is shared by TR and EN")}>TR+EN</span>}
      </label>
      {children}
      {error ? (
        <p className="adm-field__error" id={id + "-err"} role="alert">{error}</p>
      ) : hint ? (
        <p className="adm-field__hint" id={id + "-hint"}>{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  value, onChange, placeholder, type = "text", mono, ...c
}: Common & { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean }) {
  const auto = useId();
  const id = c.id ?? auto;
  return (
    <Wrap {...c} id={id}>
      <input
        id={id}
        className={"adm-input" + (mono ? " adm-input--mono" : "")}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={c.error ? id + "-err" : c.hint ? id + "-hint" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
}

export function TextArea({
  value, onChange, rows = 4, mono, placeholder, ...c
}: Common & { value: string; onChange: (v: string) => void; rows?: number; mono?: boolean; placeholder?: string }) {
  const auto = useId();
  const id = c.id ?? auto;
  return (
    <Wrap {...c} id={id} wide={c.wide ?? true}>
      <textarea
        id={id}
        className={"adm-input adm-textarea" + (mono ? " adm-input--mono" : "")}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={c.error ? id + "-err" : c.hint ? id + "-hint" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
}

/**
 * Edits a string[] (or other parsed value) through a text draft, so typing a trailing comma or an empty
 * line does not get normalised away mid-keystroke.
 */
export function ParsedText<T>({
  value, parse, format, onChange, rows, ...c
}: Common & { value: T; parse: (s: string) => T; format: (v: T) => string; onChange: (v: T) => void; rows?: number }) {
  const [draft, setDraft] = useState(() => format(value));
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    // External change (undo, language switch, reorder): adopt it unless it is what the draft already says.
    setSeen(value);
    if (JSON.stringify(parse(draft)) !== JSON.stringify(value)) setDraft(format(value));
  }
  const set = (s: string) => {
    setDraft(s);
    const v = parse(s);
    setSeen(v);
    onChange(v);
  };
  return rows ? (
    <TextArea {...c} rows={rows} value={draft} onChange={set} />
  ) : (
    <TextField {...c} value={draft} onChange={set} />
  );
}

export const lines = {
  parse: (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean),
  format: (v: string[]) => v.join("\n"),
};
export const commas = {
  parse: (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean),
  format: (v: string[]) => v.join(", "),
};

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="adm-check">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export function IconButton({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; danger?: boolean }) {
  return (
    <button type="button" className={"adm-iconbtn" + (danger ? " adm-iconbtn--danger" : "")} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/** Up / down / delete controls shared by accordions, gallery cards and blocks. */
export function ItemTools({ index, count, onMove, onDelete, what }: { index: number; count: number; onMove: (dir: -1 | 1) => void; onDelete: () => void; what: string }) {
  const { t } = useAdminLang();
  return (
    <div className="adm-tools">
      <IconButton label={`${what}: ${t("yukarı taşı", "move up")}`} onClick={() => onMove(-1)} disabled={index === 0}>↑</IconButton>
      <IconButton label={`${what}: ${t("aşağı taşı", "move down")}`} onClick={() => onMove(1)} disabled={index === count - 1}>↓</IconButton>
      <IconButton label={`${what}: ${t("sil", "delete")}`} onClick={onDelete} danger>✕</IconButton>
    </div>
  );
}
