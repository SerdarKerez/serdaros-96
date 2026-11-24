/* SerdarOS 96 — app registry (built from the content + games modules) and label metadata. */
import type { AppDef } from "@/lib/os-types";
import type { Lang } from "@/lib/i18n";
import { getContent } from "@/lib/content-i18n";
import { label } from "@/lib/labels";
import { contentApps, contentAppTitle } from "./content";
import { gameApps } from "./games";

export const APPS: Record<string, AppDef> = {};
for (const def of [...contentApps, ...gameApps]) APPS[def.id] = def;

/** English fallback labels + icons for ids. Localized names come from lib/labels.ts. */
export const META: Record<string, { title: string; icon: string }> = {
  computer: { title: "My Computer", icon: "computer" },
  projects: { title: "My Projects", icon: "folder" },
  about: { title: "About Me.txt", icon: "text" },
  recycle: { title: "Recycle Bin", icon: "trash" },
  calculator: { title: "Calculator", icon: "calculator" },
  photos: { title: "Gallery", icon: "photos" },
  mail: { title: "Contact Me", icon: "mail" },
  games: { title: "Games", icon: "games" },
  notes: { title: "Blog", icon: "notes" },
  welcome: { title: "Welcome.txt", icon: "text" },
  copyright: { title: "Copyright.txt", icon: "text" },
  privacy: { title: "Privacy.txt", icon: "text" },
  profile: { title: "Guest profile", icon: "user" },
  help: { title: "Help / Welcome.txt", icon: "help" },
  restart: { title: "Restart SerdarOS", icon: "restart" },
  snake: { title: "Snake", icon: "snake" },
  mines: { title: "Minesweeper", icon: "mines" },
  stack: { title: "Stack", icon: "stack" },
  notepad: { title: "SerdarPad", icon: "text" },
};

/** Label + icon for a desktop / start menu id in the given language. */
export function metaFor(id: string, lang: Lang): { title: string; icon: string } {
  const m = META[id];
  const def = APPS[id];
  const files = getContent(lang).files || {};
  let title = label(id, lang) || m?.title || def?.title || id;
  if (files[id]?.title) title = files[id].title;
  return { title, icon: m?.icon || def?.icon || "text" };
}

/** Default window title for an app in the given language (apps may override it with setTitle). */
export function appTitle(appId: string, lang: Lang): string {
  const def = APPS[appId];
  return contentAppTitle(appId, lang) ?? label(appId, lang) ?? def?.title ?? metaFor(appId, lang).title;
}

/** Icon key for an app / desktop id (language independent). */
export function iconFor(id: string): string {
  return META[id]?.icon || APPS[id]?.icon || "text";
}
