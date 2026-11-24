"use client";
import type { ReactNode } from "react";
import { ItemTools } from "./fields";
import { useAdminLang } from "./i18n";

export function AccordionItem({
  id, title, meta, open, onToggle, invalid, index, count, onMove, onDelete, what, children,
}: {
  id: string;
  title: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  invalid?: boolean;
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  what: string;
  children: ReactNode;
}) {
  const { t } = useAdminLang();
  return (
    <div className={"adm-acc" + (open ? " adm-acc--open" : "") + (invalid ? " adm-acc--invalid" : "")}>
      <div className="adm-acc__bar">
        <button type="button" className="adm-acc__toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="adm-acc__caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
          <span className="adm-acc__num">{index + 1}</span>
          <span className="adm-acc__title">{title || <em className="adm-muted">{t("(başlıksız)", "(untitled)")}</em>}</span>
          {meta && <span className="adm-acc__meta">{meta}</span>}
          {invalid && <span className="adm-acc__warn" title={t("Bu öğede düzeltilmesi gereken alanlar var", "This item has fields that need fixing")}>⚠ {t("hata", "error")}</span>}
        </button>
        <ItemTools what={what} index={index} count={count} onMove={onMove} onDelete={onDelete} />
      </div>
      {open && <div className="adm-acc__body" id={id}>{children}</div>}
    </div>
  );
}

export function toggleIn(set: Set<number>, i: number): Set<number> {
  const n = new Set(set);
  if (n.has(i)) n.delete(i);
  else n.add(i);
  return n;
}
