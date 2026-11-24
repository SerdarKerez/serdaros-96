import type { ComponentType } from "react";

export type AppArgs = Record<string, unknown> | undefined;

/** Props every app component receives. */
export interface AppProps {
  winId: string;
  args: AppArgs;
  setTitle: (title: string) => void;
  close: () => void;
}

export interface AppDef {
  id: string;
  title: string;
  icon: string; // key in ICONS
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean; // default true
  singleton?: boolean; // default true
  Component: ComponentType<AppProps>;
}

export interface Profile {
  name: string;
  avatar: string | null;
  saved: boolean;
}

export interface NotifyOptions {
  timeout?: number;
  actions?: { label: string; onClick: () => void }[];
}

/** Returned by useOS() (components/os/OSContext.tsx). */
export interface OSApi {
  openApp: (id: string, args?: AppArgs) => void;
  closeWindow: (winId: string) => void;
  focusWindow: (winId: string) => void;
  notify: (text: string, opts?: NotifyOptions) => void;
  restart: () => void;
  showDesktop: () => void;
  isTouch: boolean;
  ready: boolean; // true after boot finished
  profile: Profile;
  setProfile: (p: { name: string; avatar: string | null } | null) => void;
  notesVersion: number; // bump via bumpNotes() when user notes change
  bumpNotes: () => void;
}
