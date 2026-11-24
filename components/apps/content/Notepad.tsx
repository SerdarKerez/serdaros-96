"use client";
/* SerdarPad (text editor). Apps: notepad (args {fileId} | {noteId} | {text,title}), about, welcome, copyright, privacy.
   Storage: "file:<fileId>" = edited text of a getContent(lang).files entry, "notes-user" = [{id,name,content,deleted,updated}]. */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { AppProps } from "@/lib/os-types";
import type { ContentFile } from "@/lib/content";
import { getContent } from "@/lib/content-i18n";
import { pick, useLang, type L } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { cleanName, getNotes, noteUid, setNotes, untitled } from "./shared";

const READ_ONLY: Record<string, boolean> = { welcome: true, copyright: true, privacy: true };

interface Doc {
  kind: "file" | "note";
  fileId?: string;
  noteId: string | null;
  name: string;
  original: string;
  text: string;
  readOnly: boolean;
  edited: boolean;
  fresh?: boolean;
}

type PadState = "readonly" | "dirty" | "saved" | "clean";
const STATE_LABELS: Record<PadState, L> = {
  readonly: { tr: "Salt okunur", en: "Read-only" },
  dirty: { tr: "Kaydedilmemiş değişiklikler", en: "Unsaved changes" },
  saved: { tr: "Yerel olarak kaydedildi", en: "Saved locally" },
  clean: { tr: "Metin belgesi", en: "Text document" },
};

/** Content file titles in both languages (a file keeps its identity whichever title it is saved under). */
function isFileTitle(fileId: string, name: string): boolean {
  return getContent("tr").files[fileId]?.title === name || getContent("en").files[fileId]?.title === name;
}

function resolveDoc(args: AppProps["args"], fixedFileId: string | null, FILES: Record<string, ContentFile>): Doc {
  const a = (args || {}) as Record<string, unknown>;
  const fileId = fixedFileId || (typeof a.fileId === "string" ? a.fileId : "");
  if (fileId && FILES[fileId]) {
    const f = FILES[fileId];
    const saved = storage.get<unknown>("file:" + fileId, null);
    return {
      kind: "file", fileId, noteId: null, name: f.title, original: f.text,
      text: typeof saved === "string" ? saved : f.text, readOnly: !!READ_ONLY[fileId], edited: typeof saved === "string",
    };
  }
  if (a.noteId) {
    const n = getNotes().find((x) => x.id === a.noteId);
    if (n) return { kind: "note", noteId: n.id, name: n.name, original: n.content, text: n.content, readOnly: false, edited: false };
  }
  const name = cleanName(a.title) || untitled();
  const text = a.text != null ? String(a.text) : "";
  return { kind: "note", noteId: null, name, original: text, text, readOnly: false, edited: false, fresh: true };
}

function Pad({ args, setTitle, close, fixedFileId }: AppProps & { fixedFileId: string | null }) {
  const os = useOS();
  const { lang, t } = useLang();
  const C = getContent(lang);
  const FILES = C.files;
  const [doc, setDoc] = useState<Doc>(() => resolveDoc(args, fixedFileId, FILES));
  const [text, setText] = useState(doc.text);
  const [state, setState] = useState<PadState>(doc.readOnly ? "readonly" : doc.fresh && doc.text ? "dirty" : "clean");
  const [wrap, setWrap] = useState(() => storage.get<unknown>("pad-wrap", true) !== false);
  const [nameValue, setNameValue] = useState(doc.name);
  const [saveStatus, setSaveStatus] = useState<L | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [findStatus, setFindStatus] = useState<L | null>(null);
  const [pos, setPos] = useState({ ln: 1, col: 1 });

  const taRef = useRef<HTMLTextAreaElement>(null);
  const menusRef = useRef<HTMLDivElement>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropRef = useRef<HTMLDivElement>(null);

  // Language switch: a built-in file follows the language (its text too, unless the user edited it).
  const [docLang, setDocLang] = useState(lang);
  if (docLang !== lang) {
    setDocLang(lang);
    const f = doc.kind === "file" && doc.fileId ? FILES[doc.fileId] : undefined;
    if (f && doc.fileId) {
      const untouched = !doc.edited && text === doc.original;
      if (untouched) setText(f.text);
      if (nameValue === doc.name) setNameValue(f.title);
      setDoc({ ...doc, name: f.title, original: f.text, text: untouched ? f.text : doc.text });
    }
  }

  const setTitleRef = useRef(setTitle);
  useEffect(() => { setTitleRef.current = setTitle; });
  useEffect(() => { setTitleRef.current(doc.name + " — SerdarPad"); }, [doc.name]);

  const updatePos = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart || 0).split("\n");
    setPos({ ln: before.length, col: before[before.length - 1].length + 1 });
  }, []);

  // Initial focus
  useEffect(() => {
    const t = setTimeout(() => {
      const ta = taRef.current;
      if (!ta) return;
      try { ta.focus(); ta.setSelectionRange(0, 0); ta.scrollTop = 0; updatePos(); } catch { /* ignore */ }
    }, 30);
    return () => clearTimeout(t);
  }, [updatePos]);

  // Close menus on outside pointerdown
  useEffect(() => {
    if (!openMenu) return;
    const outside = (e: PointerEvent) => {
      if (menusRef.current && !menusRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [openMenu]);

  // Focus first enabled item when a menu opens
  useEffect(() => {
    if (!openMenu || !dropRef.current) return;
    const first = dropRef.current.querySelector<HTMLButtonElement>("button:not(:disabled)");
    first?.focus();
  }, [openMenu]);

  function closeMenus() { setOpenMenu(null); }

  function save() {
    if (doc.readOnly) return;
    const name = cleanName(nameValue) || doc.name;
    const value = taRef.current ? taRef.current.value : text;
    setNameValue(name);
    if (doc.kind === "file" && doc.fileId && isFileTitle(doc.fileId, name)) {
      if (value === doc.original) {
        storage.set("file:" + doc.fileId, null);
        setDoc({ ...doc, name, edited: false });
      } else {
        storage.set("file:" + doc.fileId, value);
        setDoc({ ...doc, name, edited: true });
      }
    } else {
      const list = getNotes();
      let note = doc.kind === "note" && doc.noteId ? list.find((x) => x.id === doc.noteId) : undefined;
      if (!note) { note = { id: noteUid(), deleted: false, name, content: "", updated: 0 }; list.push(note); }
      // eslint-disable-next-line react-hooks/purity -- runs only from the Save handler, not during render
      note.name = name; note.content = value; note.updated = Date.now(); note.deleted = false;
      setNotes(list);
      os.bumpNotes();
      setDoc({ kind: "note", noteId: note.id, name, original: value, text: value, readOnly: false, edited: false });
    }
    setState("saved");
    const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    setSaveStatus({ tr: "Kaydedildi · " + time, en: "Saved · " + time });
  }

  function trash() {
    const list = getNotes();
    list.forEach((n) => { if (n.id === doc.noteId) n.deleted = true; });
    setNotes(list);
    os.bumpNotes();
    os.notify(doc.name + t(" geri dönüşüm kutusuna taşındı.", " was moved to the Recycle Bin."));
    close();
  }

  function resetOriginal() {
    const original = doc.kind === "file" && doc.fileId ? FILES[doc.fileId].text : doc.original;
    setText(original);
    if (doc.kind === "file" && doc.fileId) {
      storage.set("file:" + doc.fileId, null);
      setDoc({ ...doc, edited: false });
    }
    setState("clean");
    setSaveStatus({ tr: "Orijinal metin geri yüklendi.", en: "Original text restored." });
    setTimeout(updatePos, 0);
  }

  function showFind() {
    setFindOpen(true);
    const ta = taRef.current;
    if (ta) {
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      if (sel && sel.indexOf("\n") < 0) setFindValue(sel);
    }
    setTimeout(() => { findInputRef.current?.focus(); findInputRef.current?.select(); }, 0);
  }

  function hideFind() {
    setFindOpen(false);
    setFindStatus(null);
    taRef.current?.focus();
  }

  function findNext() {
    const q = findValue;
    const ta = taRef.current;
    if (!q || !ta) { setFindStatus(null); return; }
    const hay = ta.value.toLocaleLowerCase("tr");
    const needle = q.toLocaleLowerCase("tr");
    let i = hay.indexOf(needle, ta.selectionEnd || 0);
    let wrapped = false;
    if (i < 0) { i = hay.indexOf(needle); wrapped = i >= 0; }
    if (i < 0) { setFindStatus({ tr: "\"" + q + "\" bulunamadı.", en: "\"" + q + "\" not found." }); return; }
    ta.focus();
    ta.setSelectionRange(i, i + q.length);
    const lineH = parseFloat(getComputedStyle(ta).lineHeight) || 24;
    ta.scrollTop = Math.max(0, (ta.value.slice(0, i).split("\n").length - 3) * lineH);
    setFindStatus(wrapped ? { tr: "Baştan arandı.", en: "Searched from the top." } : null);
    updatePos();
  }

  function toggleWrap() {
    const w = !wrap;
    setWrap(w);
    storage.set("pad-wrap", w);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === "s" || e.key === "S")) { e.preventDefault(); save(); }
    else if (mod && (e.key === "f" || e.key === "F")) { e.preventDefault(); showFind(); }
    else if (e.key === "Escape") {
      if (openMenu) {
        const b = menuBtnRefs.current[openMenu];
        closeMenus(); b?.focus(); e.stopPropagation();
      } else if (findOpen) {
        setFindOpen(false); taRef.current?.focus(); e.stopPropagation();
      }
    }
  }

  function item(label: string, hint: string, fn: () => void, disabled?: boolean): ReactNode {
    return (
      <button key={label} type="button" role="menuitem" disabled={!!disabled} onClick={() => { closeMenus(); fn(); }}>
        {label}
        {hint ? <span>{hint}</span> : null}
      </button>
    );
  }

  function menuItems(label: string): ReactNode[] {
    switch (label) {
      case "File":
        return [
          doc.readOnly ? null : item(t("Kaydet", "Save"), "Ctrl+S", save),
          item(t("Yeni not", "New note"), "", () => os.openApp("notepad", { text: "", title: "" })),
          doc.kind === "note" && doc.noteId ? item(t("Geri dönüşüm kutusuna taşı", "Move to Recycle Bin"), "", trash) : null,
          item(t("Kapat", "Close"), "", close),
        ];
      case "Edit":
        return [
          item(t("Tümünü seç", "Select all"), "Ctrl+A", () => { taRef.current?.focus(); taRef.current?.select(); }),
          item(t("Orijinale dön", "Revert to original"), "", resetOriginal, doc.readOnly || (text === doc.original && !doc.edited)),
          item(t("Sözcük kaydır", "Word wrap"), wrap ? "✓" : "", toggleWrap),
        ];
      case "Search":
        return [item(t("Bul…", "Find…"), "Ctrl+F", showFind)];
      default:
        return [
          <div key="about" className="serdarpad__about">
            <strong>SerdarPad 96</strong>
            <p>{t("Metin dosyaları için küçük bir yuva.", "A small home for text files.")}</p>
            <p>
              {doc.readOnly
                ? t(
                    "Bu dosya salt okunur. Kopyasını değiştirmek için metni seçip yeni bir nota yapıştırabilirsin.",
                    "This file is read-only. To edit a copy, select the text and paste it into a new note.",
                  )
                : t("Değişikliklerin Ctrl+S ile bu tarayıcıda saklanır.", "Ctrl+S saves your changes in this browser.")}
            </p>
          </div>,
        ];
    }
  }

  function menu(label: string) {
    const isOpen = openMenu === label;
    return (
      <div className="serdarpad__menu" key={label}>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen ? "true" : "false"}
          ref={(b) => { menuBtnRefs.current[label] = b; }}
          onClick={(e) => { e.stopPropagation(); setOpenMenu(isOpen ? null : label); }}
          onMouseEnter={() => { if (openMenu && openMenu !== label) setOpenMenu(label); }}
        >
          {label}
        </button>
        {isOpen && (
          <div className="serdarpad__dropdown" role="menu" ref={dropRef}>
            {menuItems(label)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="serdarpad" onKeyDown={onKeyDown}>
      <div className="serdarpad__menus" role="menubar" ref={menusRef}>
        {/* eslint-disable-next-line react-hooks/refs -- refs are only touched in ref callbacks and event handlers */}
        {["File", "Edit", "Search", "Help"].map(menu)}
        <span className="serdarpad__app-name">SerdarPad</span>
      </div>

      {!doc.readOnly && (
        <form className="serdarpad__save" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label>
            File name
            <input
              type="text"
              maxLength={80}
              value={nameValue}
              aria-label={t("Dosya adı", "File name")}
              spellCheck={false}
              onChange={(e) => setNameValue(e.target.value)}
            />
          </label>
          <button type="submit">Save</button>
          <span role="status">{saveStatus ? pick(lang, saveStatus) : ""}</span>
        </form>
      )}

      <form className="serdarpad__find" hidden={!findOpen} onSubmit={(e) => { e.preventDefault(); findNext(); }}>
        <label>
          {t("Bul", "Find")}
          <input
            ref={findInputRef}
            type="search"
            aria-label={t("Bul", "Find")}
            spellCheck={false}
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
          />
        </label>
        <button type="submit">{t("Sonrakini bul", "Find next")}</button>
        <button type="button" aria-label={t("Bul çubuğunu kapat", "Close the find bar")} onClick={hideFind}>×</button>
        <span role="status">{findStatus ? pick(lang, findStatus) : ""}</span>
      </form>

      <div className="serdarpad__page">
      {doc.fileId === "about" && C.owner.photo && (
        <figure className="serdarpad__idphoto">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static photo */}
          <img src={C.owner.photo} alt={t("Vesikalık: ", "ID photo: ") + C.owner.name} draggable={false} />
          <figcaption>{C.owner.name}</figcaption>
        </figure>
      )}
      <textarea
        ref={taRef}
        className="serdarpad__editor"
        spellCheck={false}
        aria-label={doc.name}
        readOnly={doc.readOnly}
        value={text}
        wrap={wrap ? "soft" : "off"}
        style={{ whiteSpace: wrap ? "pre-wrap" : "pre", overflowX: wrap ? "hidden" : "auto" }}
        onChange={(e) => {
          setText(e.target.value);
          if (!doc.readOnly) { setState("dirty"); setSaveStatus(null); }
          updatePos();
        }}
        onClick={updatePos}
        onKeyUp={updatePos}
        onSelect={updatePos}
        onFocus={updatePos}
      />
      </div>

      <div className="serdarpad__status">
        <span>{pick(lang, STATE_LABELS[state])}</span>
        <span>{"Ln " + pos.ln + ", Col " + pos.col}</span>
        <span>{text.length + t(" karakter", " characters")}</span>
      </div>
    </div>
  );
}

export default function Notepad(props: AppProps) {
  return <Pad {...props} fixedFileId={null} />;
}

/** Fixed-file variant factory (about, welcome, copyright, privacy). */
export function makeFileApp(fileId: string) {
  function FileApp(props: AppProps) {
    return <Pad {...props} fixedFileId={fileId} />;
  }
  FileApp.displayName = "SerdarPad_" + fileId;
  return FileApp;
}
