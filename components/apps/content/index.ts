import type { AppDef } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import type { Lang } from "@/lib/i18n";
import Notepad, { makeFileApp } from "./Notepad";
import { folderTitle, makeFolderApp, META, type FolderId } from "./Folder";
import Project from "./Project";
import Photos from "./Photos";
import PhotoViewer from "./PhotoViewer";
import Mail from "./Mail";
import Profile from "./Profile";
import Help from "./Help";
import Blog from "./Blog";

const PAD_SIZE = { width: 710, height: 500, minWidth: 320, minHeight: 260 };
const FOLDER_SIZE = { width: 560, height: 410, minWidth: 300, minHeight: 240 };

const FILE_IDS = ["about", "welcome", "copyright", "privacy"] as const;
const FOLDER_IDS: FolderId[] = ["computer", "games", "recycle", "projects"];

const fileApps: AppDef[] = FILE_IDS.filter((id) => getContent("tr").files[id])
  .map((id) => ({
    id,
    title: getContent("tr").files[id].title + " — SerdarPad",
    icon: "text",
    ...PAD_SIZE,
    Component: makeFileApp(id),
  }));

const folderApps: AppDef[] = FOLDER_IDS.map((id) => ({
  id,
  title: folderTitle(id, "tr"),
  icon: id === "projects" ? "folder" : META[id][1],
  ...FOLDER_SIZE,
  Component: makeFolderApp(id),
}));

export const contentApps: AppDef[] = [
  { id: "notepad", title: "SerdarPad", icon: "text", ...PAD_SIZE, singleton: false, Component: Notepad },
  ...fileApps,
  { id: "notes", title: "Blog", icon: "notes", width: 860, height: 640, minWidth: 320, minHeight: 320, Component: Blog },
  ...folderApps,
  { id: "project", title: "Proje", icon: "folder", width: 800, height: 640, minWidth: 320, minHeight: 320, Component: Project },
  { id: "photos", title: "Gallery", icon: "photos", width: 720, height: 510, minWidth: 300, minHeight: 340, Component: Photos },
  { id: "photo-viewer", title: "Photo viewer", icon: "photos", width: 780, height: 550, minWidth: 300, minHeight: 300, Component: PhotoViewer },
  { id: "mail", title: "Contact Me", icon: "mail", width: 650, height: 620, minWidth: 320, minHeight: 400, Component: Mail },
  { id: "profile", title: "Guest profile", icon: "user", width: 560, height: 660, minWidth: 320, minHeight: 300, Component: Profile },
  { id: "help", title: "Help", icon: "help", width: 640, height: 540, minWidth: 320, minHeight: 300, Component: Help },
];

/** Language-dependent default window titles for content apps (undefined = use the static def title). */
export function contentAppTitle(appId: string, lang: Lang): string | undefined {
  const files = getContent(lang).files;
  if ((FILE_IDS as readonly string[]).includes(appId) && files[appId]) return files[appId].title + " — SerdarPad";
  if ((FOLDER_IDS as string[]).includes(appId)) return folderTitle(appId as FolderId, lang);
  if (appId === "project") return lang === "en" ? "Project" : "Proje";
  return undefined;
}

export { avatarSvg } from "./avatars";
