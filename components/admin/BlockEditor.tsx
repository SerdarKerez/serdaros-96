"use client";
/* Content block editor shared by blog posts and project pages. Blocks collapse to a one-line preview. */
import { useId, useState } from "react";
import type { Block } from "@/lib/blog/types";
import { Checkbox, ItemTools, ParsedText, TextArea, TextField, lines, commas } from "./fields";
import { ImageField } from "./ImageField";
import { move, newBlock, remapOpen, removeAt, replaceAt } from "./model";
import { useAdminLang, type T } from "./i18n";

const typesFor = (t: T): { type: Block["type"]; label: string }[] => [
  { type: "p", label: t("Paragraf", "Paragraph") },
  { type: "h", label: t("Ara başlık", "Subheading") },
  { type: "img", label: t("Görsel", "Image") },
  { type: "list", label: t("Liste", "List") },
  { type: "quote", label: t("Alıntı", "Quote") },
  { type: "code", label: t("Kod", "Code") },
  { type: "table", label: t("Tablo", "Table") },
  { type: "note", label: t("Not kutusu", "Note box") },
];

function preview(b: Block): string {
  switch (b.type) {
    case "p": case "h": case "note": case "quote": return b.text;
    case "img": return b.alt || b.caption || b.src;
    case "list": return b.items.join(" · ");
    case "code": return (b.lang ? `[${b.lang}] ` : "") + b.code.split("\n")[0];
    case "table": return b.head.join(" | ");
  }
}

const rows = {
  parse: (s: string) => s.split("\n").filter((l) => l.trim()).map((l) => l.split("|").map((c) => c.trim())),
  format: (v: string[][]) => v.map((r) => r.join(" | ")).join("\n"),
};

function BlockFields({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const { t } = useAdminLang();
  switch (block.type) {
    case "p": case "h": case "note":
      return (
        <TextArea
          label={block.type === "h" ? t("Başlık metni", "Heading text") : t("Metin", "Text")}
          rows={block.type === "h" ? 1 : 4}
          value={block.text}
          hint={block.type === "h" ? undefined : t("**kalın**, *italik* ve `kod` desteklenir.", "**bold**, *italic* and `code` are supported.")}
          onChange={(text) => onChange({ ...block, text })}
        />
      );
    case "quote":
      return (
        <>
          <TextArea label={t("Alıntı", "Quote")} rows={3} value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <TextField label={t("Kaynak (opsiyonel)", "Source (optional)")} value={block.cite ?? ""} onChange={(cite) => onChange({ ...block, cite })} />
        </>
      );
    case "img":
      return (
        <>
          <ImageField label={t("Görsel", "Image")} value={block.src} onChange={(src) => onChange({ ...block, src })} />
          <TextField label={t("Alt metin", "Alt text")} value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
          <TextField label={t("Alt yazı (opsiyonel)", "Caption (optional)")} value={block.caption ?? ""} onChange={(caption) => onChange({ ...block, caption })} />
        </>
      );
    case "list":
      return (
        <>
          <ParsedText label={t("Maddeler (her satır bir madde)", "Items (one per line)")} rows={4} wide value={block.items} {...lines} onChange={(items) => onChange({ ...block, items })} />
          <Checkbox label={t("Numaralı liste", "Numbered list")} checked={!!block.ordered} onChange={(ordered) => onChange({ ...block, ordered })} />
        </>
      );
    case "code":
      return (
        <>
          <TextField label={t("Dil", "Language")} value={block.lang ?? ""} placeholder="python, sql, ts…" mono onChange={(lang) => onChange({ ...block, lang })} />
          <TextArea label={t("Kod", "Code")} rows={6} mono value={block.code} onChange={(code) => onChange({ ...block, code })} />
        </>
      );
    case "table":
      return (
        <>
          <ParsedText label={t("Başlıklar (virgülle ayır)", "Headers (comma separated)")} wide value={block.head} {...commas} onChange={(head) => onChange({ ...block, head })} />
          <ParsedText label={t("Satırlar (her satır bir satır, hücreleri | ile ayır)", "Rows (one per line, separate cells with |)")} rows={4} wide value={block.rows} {...rows} onChange={(r) => onChange({ ...block, rows: r })} />
        </>
      );
  }
}

export function BlockEditor({ blocks, onChange, label }: { blocks: Block[]; onChange: (b: Block[]) => void; label?: string }) {
  const { t } = useAdminLang();
  const TYPES = typesFor(t);
  const typeLabel = (ty: Block["type"]) => TYPES.find((x) => x.type === ty)?.label ?? ty;
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [pick, setPick] = useState<Block["type"]>("p");
  const pickId = useId();

  const toggle = (i: number) => setOpen((o) => { const n = new Set(o); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <div className="adm-blocks adm-field--wide">
      <div className="adm-blocks__head">
        <span className="adm-field__label">{label ?? t("İçerik blokları", "Content blocks")} <span className="adm-muted">({blocks.length})</span></span>
      </div>
      {blocks.length === 0 && <p className="adm-muted adm-blocks__empty">{t("Henüz blok yok.", "No blocks yet.")}</p>}
      <ol className="adm-blocks__list">
        {blocks.map((b, i) => {
          const isOpen = open.has(i);
          return (
            <li key={i} className={"adm-block" + (isOpen ? " adm-block--open" : "")}>
              <div className="adm-block__bar">
                <button type="button" className="adm-block__toggle" aria-expanded={isOpen} onClick={() => toggle(i)}>
                  <span className={"adm-badge adm-badge--" + b.type}>{typeLabel(b.type)}</span>
                  <span className="adm-block__preview">{preview(b) || <em className="adm-muted">{t("boş", "empty")}</em>}</span>
                </button>
                <ItemTools
                  what={t(`${i + 1}. blok`, `Block ${i + 1}`)}
                  index={i}
                  count={blocks.length}
                  onMove={(dir) => {
                    if (i + dir < 0 || i + dir >= blocks.length) return;
                    onChange(move(blocks, i, dir));
                    setOpen((o) => remapOpen(o, { move: [i, i + dir] }));
                  }}
                  onDelete={() => {
                    onChange(removeAt(blocks, i));
                    setOpen((o) => remapOpen(o, { remove: i }));
                  }}
                />
              </div>
              {isOpen && (
                <div className="adm-block__body adm-grid">
                  <BlockFields block={b} onChange={(nb) => onChange(replaceAt(blocks, i, nb))} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="adm-blocks__add">
        <label htmlFor={pickId} className="adm-sr">{t("Eklenecek blok türü", "Block type to add")}</label>
        <select id={pickId} className="adm-input adm-select" value={pick} onChange={(e) => setPick(e.target.value as Block["type"])}>
          {TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
        </select>
        <button
          type="button"
          className="adm-btn adm-btn--small"
          onClick={() => {
            onChange([...blocks, newBlock(pick)]);
            setOpen((o) => new Set(o).add(blocks.length));
          }}
        >
          {t("+ Blok ekle", "+ Add block")}
        </button>
      </div>
    </div>
  );
}
