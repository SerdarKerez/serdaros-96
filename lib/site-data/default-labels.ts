/* Default folder / file / app names (seed + fallback). Editable in /admin. */
import type { L } from "@/lib/i18n";

export const DEFAULT_LABELS: Record<string, L> = {
  computer: { tr: "Bilgisayarım", en: "My Computer" },
  projects: { tr: "Projelerim", en: "My Projects" },
  about: { tr: "Hakkımda.txt", en: "About Me.txt" },
  recycle: { tr: "Geri Dönüşüm Kutusu", en: "Recycle Bin" },
  calculator: { tr: "Hesap Makinesi", en: "Calculator" },
  photos: { tr: "Galeri", en: "Gallery" },
  mail: { tr: "İletişim", en: "Contact Me" },
  games: { tr: "Oyunlar", en: "Games" },
  notes: { tr: "Blog", en: "Blog" },
  welcome: { tr: "Hoş Geldin.txt", en: "Welcome.txt" },
  copyright: { tr: "Telif Hakkı.txt", en: "Copyright.txt" },
  privacy: { tr: "Gizlilik.txt", en: "Privacy.txt" },
  profile: { tr: "Misafir profili", en: "Guest profile" },
  help: { tr: "Yardım", en: "Help / Welcome.txt" },
  restart: { tr: "SerdarOS'u yeniden başlat", en: "Restart SerdarOS" },
  snake: { tr: "Snake", en: "Snake" },
  mines: { tr: "Mayın Tarlası", en: "Minesweeper" },
  stack: { tr: "Stack", en: "Stack" },
  notepad: { tr: "SerdarPad", en: "SerdarPad" },
};
