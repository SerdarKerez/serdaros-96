"use client";
/* Folder windows (file browser). Apps: computer, games, recycle, projects. */
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { getContent } from "@/lib/content-i18n";
import { useLang, type Lang } from "@/lib/i18n";
import { useOS } from "@/components/os/OSContext";
import { getNotes, iconSvg, setNotes, SvgSpan, type UserNote } from "./shared";
import { openProject } from "./Project";
import { label } from "@/lib/labels";

export const META: Record<string, [string, string]> = {
  computer: ["My Computer", "computer"], projects: ["My Projects", "folder"], games: ["Games", "games"],
  recycle: ["Recycle Bin", "trash"], calculator: ["Calculator", "calculator"], photos: ["Gallery", "photos"],
  mail: ["Contact Me", "mail"], profile: ["Guest profile", "user"], help: ["Help", "help"], notepad: ["SerdarPad", "text"], notes: ["Blog", "notes"],
  snake: ["Snake", "snake"], mines: ["Minesweeper", "mines"], stack: ["Stack", "stack"],
};

interface Item {
  key: string;
  label: string;
  icon: string;
  note?: UserNote;
  open: () => void;
}

export type FolderId = "computer" | "games" | "recycle" | "projects";

export function folderTitle(id: FolderId, lang: Lang): string {
  return getContent(lang).folders[id]?.title || label(id, lang) || META[id][0];
}

function Folder({ folderId }: { folderId: FolderId }) {
  const os = useOS();
  const { lang, t } = useLang();
  const C = getContent(lang);
  const FILES = C.files;
  const FOLDERS = C.folders;
  const conf = FOLDERS[folderId] || { title: "", items: [] };
  const title = folderTitle(folderId, lang);
  const desk = t("Masaüstü", "Desktop");
  const path = folderId === "games" ? desk + " / " + label("computer", lang) + " / " + title : desk + " / " + title;
  const hasToolbar = folderId === "computer" || folderId === "recycle";
  const folderIcon = (META[folderId] || ["", "folder"])[1];

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const items: Item[] = useMemo(() => {
    const open = (id: string, args?: Record<string, unknown>) => os.openApp(id, args);
    const noteItem = (n: UserNote): Item => ({ key: n.id, label: n.name, icon: "text", note: n, open: () => open("notepad", { noteId: n.id }) });
    const appItem = (id: string): Item => {
      if (FILES[id]) return { key: id, label: FILES[id].title, icon: "text", open: () => open(id) };
      const m: [string, string] = [label(id, lang) || (META[id] || [id])[0], (META[id] || [id, "text"])[1]];
      const f = FOLDERS[id];
      return { key: id, label: (f && f.title) || m[0], icon: m[1], open: () => open(id) };
    };
    if (folderId === "projects") {
      return C.projects.map((p, i) => ({ key: "p" + i, label: p.name, icon: p.icon || "folder", open: () => openProject(os, i) }));
    }
    if (folderId === "recycle") return getNotes().filter((n) => n.deleted).map(noteItem);
    let list = (conf.items || []).map(appItem);
    if (folderId === "computer") list = list.concat(getNotes().filter((n) => !n.deleted).map(noteItem));
    return list;
    // notesVersion triggers re-read of storage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, os.notesVersion, os.openApp, lang]);

  const sel = selected ? items.find((i) => i.key === selected) : undefined;
  const effectiveSelected = sel ? selected : null;

  useEffect(() => {
    if (confirmIds) confirmRef.current?.querySelector("button")?.focus();
  }, [confirmIds]);

  function moveNote(id: string, deleted: boolean) {
    const list = getNotes();
    list.forEach((n) => { if (n.id === id) n.deleted = deleted; });
    setSelected(null);
    setNotes(list);
    os.bumpNotes();
  }
  function askDelete(ids: string[]) {
    if (!ids.length) return;
    setConfirmIds(ids);
  }
  function confirmDelete() {
    if (!confirmIds) return;
    const ids = confirmIds;
    setNotes(getNotes().filter((n) => ids.indexOf(n.id) < 0));
    os.bumpNotes();
    setConfirmIds(null);
  }

  function onItemClick(e: MouseEvent<HTMLButtonElement>, it: Item) {
    e.stopPropagation();
    const pt = (e.nativeEvent as PointerEvent).pointerType;
    if (pt === "touch" && folderId !== "recycle") { it.open(); return; }
    setSelected(it.key);
  }

  let empty = null;
  if (!items.length) {
    const emptyTitle =
      folderId === "recycle"
        ? t("Burada bir şey yok.", "Nothing here.")
        : folderId === "projects"
          ? t("Biraz yapım aşamasında.", "A bit under construction.")
          : t("Bu klasör boş.", "This folder is empty.");
    const emptyMsg =
      conf.empty ||
      (folderId === "projects"
        ? t("Serdar'ın projeleri yakında burada olacak.", "Serdar's projects will be here soon.")
        : t("Gösterilecek öğe yok.", "No items to show."));
    empty = (
      <div className="file-browser__empty">
        <SvgSpan className="file-icon" svg={iconSvg(folderIcon)} />
        <h3>{emptyTitle}</h3>
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div
      className="file-browser"
      onKeyDown={(e) => { if (e.key === "Escape" && confirmIds) { setConfirmIds(null); e.stopPropagation(); } }}
    >
      <div className="file-browser__address">
        <span>{t("Adres", "Address")}</span>
        <div>
          <SvgSpan className="file-browser__address-icon" svg={iconSvg(folderIcon)} />
          <span>{path}</span>
        </div>
      </div>

      {hasToolbar && (
        <div className="file-browser__toolbar">
          {folderId === "computer" ? (
            <>
              <button type="button" onClick={() => os.openApp("notepad", { text: "", title: "" })}>{t("Yeni not", "New note")}</button>
              <button
                type="button"
                disabled={!(sel && sel.note)}
                title={t("Seçili notu geri dönüşüm kutusuna taşı", "Move the selected note to the Recycle Bin")}
                onClick={() => { if (sel?.note) moveNote(sel.note.id, true); }}
              >
                {t("Sil", "Delete")}
              </button>
            </>
          ) : (
            <>
              <button type="button" disabled={!sel} onClick={() => { if (sel?.note) moveNote(sel.note.id, false); }}>{t("Geri yükle", "Restore")}</button>
              <button type="button" disabled={!sel} onClick={() => { if (sel?.note) askDelete([sel.note.id]); }}>{t("Kalıcı olarak sil", "Delete permanently")}</button>
              <button
                type="button"
                disabled={!items.length}
                onClick={() => askDelete(items.map((i) => i.note!.id))}
              >
                {t("Kutuyu boşalt", "Empty Recycle Bin")}
              </button>
            </>
          )}
        </div>
      )}

      <div className="file-browser__confirmation" role="alertdialog" hidden={!confirmIds} ref={confirmRef}>
        {confirmIds && (
          <>
            <span>
              {t(
                confirmIds.length + " not kalıcı olarak silinsin mi? Bu işlem geri alınamaz.",
                "Permanently delete " + confirmIds.length + (confirmIds.length === 1 ? " note" : " notes") + "? This can't be undone.",
              )}
            </span>
            <button type="button" onClick={confirmDelete}>{t("Kalıcı olarak sil", "Delete permanently")}</button>
            <button type="button" onClick={() => setConfirmIds(null)}>{t("Vazgeç", "Cancel")}</button>
          </>
        )}
      </div>

      <div className="file-browser__content" onClick={() => { if (effectiveSelected) setSelected(null); }}>
        {empty || (
          <div className="file-browser__items" role="listbox" aria-label={title}>
            {items.map((it) => {
              const on = it.key === effectiveSelected;
              return (
                <button
                  key={it.key}
                  type="button"
                  className="file-shortcut file-shortcut--folder"
                  role="option"
                  aria-selected={on ? "true" : "false"}
                  title={it.label}
                  onClick={(e) => onItemClick(e, it)}
                  onDoubleClick={() => { if (folderId !== "recycle") it.open(); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); if (folderId !== "recycle") it.open(); }
                    else if (e.key === "Delete" && it.note && folderId === "computer") moveNote(it.note.id, true);
                  }}
                >
                  <SvgSpan className="file-icon" hidden svg={iconSvg(it.icon)} />
                  <span className="file-shortcut__label">{it.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="file-browser__status">
        <span>
          {t(
            items.length + " öğe" + (effectiveSelected ? " · 1 seçili" : ""),
            items.length + (items.length === 1 ? " item" : " items") + (effectiveSelected ? " · 1 selected" : ""),
          )}
        </span>
        <span>SerdarOS 96</span>
      </div>
    </div>
  );
}

export function makeFolderApp(folderId: FolderId) {
  function FolderApp() {
    return <Folder folderId={folderId} />;
  }
  FolderApp.displayName = "Folder_" + folderId;
  return FolderApp;
}
