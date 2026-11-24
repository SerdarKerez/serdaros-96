# SerdarOS 96 — Next.js port contract

Source of truth for behavior/look: the finished vanilla version at `C:/Users/Serdar/Desktop/cms/serdaros/`
(read its JS files). Port to idiomatic React 19 + Next.js 16 App Router + TypeScript (strict). The result must look
and behave identically. CSS is already copied to `styles/*.css` and imported globally in `app/layout.tsx` —
keep the same class names / DOM structure so it applies; edit only the CSS file you own if needed.

Rules
- All interactive components are client components (`"use client"`). No `window`/`localStorage` access during
  render on the server: use effects, or `storage` from `lib/storage.ts` (SSR-safe). Avoid hydration mismatches:
  `components/SerdarOS.tsx` renders the OS only after mount.
- No `innerHTML` building of UI; use JSX. SVG icon strings may be rendered with `dangerouslySetInnerHTML`
  (they are our own static strings).
- No new npm dependencies.
- Replace `window.OS`, `window.CONTENT`, `window.ICONS`, custom window events with: `useOS()` hook,
  `CONTENT` from `lib/content.ts`, `ICONS`/`<Icon>` from `components/icons.tsx`, and context state.
- Do not edit files you don't own. `lib/*`, `app/*` are owned by the main session (read only).
- Run `npx tsc --noEmit` scoped mentally to your files; final full check + `npm run build` happen after merge.

Shared types: `lib/os-types.ts` (AppDef, AppProps, OSApi, Profile). Storage: `lib/storage.ts` (same "serdaros-" prefix
and same keys as vanilla). Content: `lib/content.ts`.

## Files and owners
| files | owner |
|---|---|
| components/SerdarOS.tsx, components/os/* (OSContext.tsx with `OSProvider` + `useOS()`, Desktop, WindowFrame, Taskbar, StartMenu, Calendar, ContextMenu, Toasts, TouchHome, Boot.tsx), components/icons.tsx, components/apps/registry.ts, styles/os.css | builder-core |
| components/apps/content/* : Notepad.tsx, Folder.tsx, Project.tsx, Photos.tsx, PhotoViewer.tsx, Mail.tsx, Profile.tsx, Help.tsx, avatars.tsx; styles/apps-content.css | builder-content |
| components/apps/games/* : Calculator.tsx, Snake.tsx, Mines.tsx, Stack.tsx; components/DesktopCat.tsx; styles/apps-games.css | builder-games |

## App modules (exact exports — registry.ts imports these)
- `components/apps/content/index.ts` exports `contentApps: AppDef[]` containing ids:
  notepad (singleton:false), about, welcome, notes, copyright, privacy, computer, games, recycle, projects,
  project, photos, photo-viewer, mail, profile, help.
- `components/apps/games/index.ts` exports `gameApps: AppDef[]` containing ids: calculator, snake, mines, stack.
- `components/DesktopCat.tsx` default-exports `DesktopCat` (no props; uses `useOS()` for `ready`, `isTouch`, `notify`).
  Core renders it inside the desktop.
- `components/apps/content/avatars.tsx` exports `avatarSvg(key: string): string`. Core uses it for start menu header.
- `components/icons.tsx` exports `ICONS: Record<string,string>` and `Icon({name, size?, className?})`.
  Same keys as vanilla icons.js.
- `components/apps/registry.ts` (core): `export const APPS: Record<string, AppDef>` built from both arrays.

## Context replaces events
- `serdaros:ready` / body.os-ready  -> `useOS().ready` (core may still toggle body class for CSS).
- `serdaros:profile-changed` -> `useOS().profile` / `setProfile()`.
- `serdaros:notes-changed` -> `useOS().notesVersion` / `bumpNotes()`.
- Apps return cleanup from `useEffect` instead of render().
- Apps that need focus-to-front behaviour: core handles pointerdown on the frame.
- Keyboard-captured apps (games): listen on their own root element or check the window is active via a
  `useIsActiveWindow(winId)` helper exported from OSContext.tsx by core:
  `export function useIsActiveWindow(winId: string): boolean`.
