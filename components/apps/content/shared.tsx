"use client";
/* Shared helpers for content apps: user notes storage + raw SVG icon span. */
import type { CSSProperties } from "react";
import { storage } from "@/lib/storage";
import { ICONS } from "@/components/icons";

export const NOTES_KEY = "notes-user";

export interface UserNote {
  id: string;
  name: string;
  content: string;
  deleted: boolean;
  updated: number;
}

export function getNotes(): UserNote[] {
  const l = storage.get<unknown>(NOTES_KEY, []);
  return Array.isArray(l) ? (l as UserNote[]) : [];
}

/** Persist notes; caller must call bumpNotes() from useOS() afterwards. */
export function setNotes(list: UserNote[]): void {
  storage.set(NOTES_KEY, list);
}

export function noteUid(): string {
  return "note-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function cleanName(name: unknown): string {
  const n = String(name ?? "").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 76);
  if (!n) return "";
  return /\.txt$/i.test(n) ? n : n + ".txt";
}

export function untitled(): string {
  const used = new Set(getNotes().map((n) => n.name));
  for (let i = 1; ; i++) if (!used.has("Untitled " + i + ".txt")) return "Untitled " + i + ".txt";
}

export function iconSvg(key: string): string {
  return ICONS[key] || ICONS.text || "";
}

/** <span> whose content is one of our static SVG icon strings (same DOM as vanilla). */
export function SvgSpan({
  svg,
  className,
  hidden,
  style,
}: {
  svg: string;
  className?: string;
  hidden?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      aria-hidden={hidden ? "true" : undefined}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
