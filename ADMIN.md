# SerdarOS 96 — Admin panel contract

Stack: Next.js 16 App Router (read node_modules/next/dist/docs before using unfamiliar APIs; middleware is now
`proxy.ts`), React 19, TS strict, Supabase (`@supabase/ssr`, `@supabase/supabase-js`). No other new deps.

## Already built (main session — read, don't rewrite)
- `lib/site-data/types.ts` — `SiteData { content: {tr,en}: Content; labels: Record<id, {tr,en}>; blog: {tr,en}: BlogPost[]; projects: {tr,en}: ProjectDetails[] }`, `SITE_KEYS`.
- `lib/site-data/defaults.ts` (`DEFAULT_SITE_DATA`), `merge.ts`, `server.ts` (`getSiteDataForAdmin()` → `{ data, storedKeys, error? }`).
- Types of the parts: `lib/content.ts` (`Content`, `Project`, `Photo`, `ContentFile`, `Folder`), `lib/blog/types.ts` (`BlogPost`, `Block`), `lib/projects/types.ts` (`ProjectDetails`).
- `lib/admin/auth.ts` — `requireAdmin()` (pages), `checkAdmin()`.
- `app/admin/actions.ts` — `login(prev, formData)` (useActionState; fields email, password, next), `logout()`, `saveSiteData(data, keys?)` → `{ok:true, savedAt} | {ok:false, code: "auth-expired"|"forbidden"|"invalid"|"db", detail?}`; login state `{ error?: "missing"|"bad-credentials"|"not-admin" }`. Actions return codes only; the client translates them.
- `lib/supabase/client.ts` `createClient()` (browser, for Storage uploads), `lib/supabase/env.ts` (`MEDIA_BUCKET = "media"`, `isSupabaseConfigured()`).
- `proxy.ts` protects `/admin/*` (redirects anon to `/admin/login`). Server pages must still call `requireAdmin()`.
- Site layout split: `app/layout.tsx` (root, no OS CSS) and `app/(site)/layout.tsx` (OS CSS). Admin must use its own CSS (`app/admin/admin.css` imported in `app/admin/layout.tsx`); do not import styles/os.css in admin.

## Build (admin-ui owns everything under app/admin/** except actions.ts, plus components/admin/**)
- `/admin/login`: email + password form (useActionState(login)), error messages, `?error=config|not-admin` notices
  (config → "Supabase ayarlı değil: .env.local"), retro SerdarOS-styled card. Must render without Supabase configured.
- `/admin`: server page → `requireAdmin()` → `getSiteDataForAdmin()` → client `<AdminApp initial storedKeys user email>`.
- UX rules (very important): NO nested tabs. Fixed left sidebar with max 5 groups; right side = selected group's
  fields as stacked section cards. Groups:
  1. **Genel & İletişim** — owner (name, shortName, os, edition, tagline, location), contact (email, github,
     instagram, linkedin), images (vesikalık `owner.photo`, wallpaper `owner.wallpaper`), and folder/app names (`labels`, compact TR|EN rows).
  2. **Metinler** — files: about, welcome, copyright, privacy (title + text, textarea).
  3. **Projeler** — `content[lang].projects` cards (slug, name, desc, tech, link, icon) + matching long page from
     `projects[lang]` (status, role, period, cover image, coverAlt, highlights list, blocks). Accordion per project; add / delete / reorder (up/down).
  4. **Blog** — `blog[lang]` posts accordion: slug, title, date, tags, cover image, coverAlt, summary, blocks.
  5. **Galeri** — `content[lang].photos` (src image + caption), compact cards, add/delete/reorder.
- Language: one small TR | EN segmented switch in the top bar selects which language is being edited (no tabs
  per field). Language-independent fields (slug, links, image src, email, tech, date) must stay in sync across
  both languages: editing them in one language updates the other; adding/deleting/reordering a project/post/photo
  applies to both languages (create the twin with the same slug, copy text as placeholder).
- Block editor (shared by blog + projects): compact list; each block a small card with type badge + fields per
  type (p/h/note/quote text; img src via ImageField + alt + caption; list items one per line + ordered checkbox;
  code lang + code; table head as comma separated + rows one per line with `|`), add block (type picker), delete, move up/down. Collapsed preview line when not focused is nice-to-have.
- ImageField: thumbnail preview + "Yükle" (upload to Storage bucket `media` at `uploads/<yyyy>/<uuid>-<safe-name>`, then store the public URL) + URL text input (external URL or `/path`). Show upload progress/errors. Accept images only, max 10 MB.
- One sticky bottom bar: "Değişiklikleri Kaydet / Yayınla" button, unsaved-changes indicator (dot + text, count of changed sections), "Geri al" (discard to last saved), beforeunload warning when dirty, Ctrl/Cmd+S saves. Save calls `saveSiteData(fullData, changedKeys)`; success toast "Yayınlandı" with "Siteyi aç ↗" link; error toast. If `storedKeys` is missing some keys show a small info banner "Veritabanı boş – ilk kayıtta mevcut içerik yüklenecek" (saving all keys seeds it).
- Top bar: "SerdarOS 96 · Admin", editing-language switch, logged-in email, "Siteyi görüntüle ↗", "Çıkış" (logout action).
- Admin UI language: TR/EN. The top-bar TR | EN switch sets both the UI language and the edited content language (`components/admin/i18n.tsx`: `AdminLangProvider`, `useAdminLang()` → `{ lang, setLang, t(tr, en) }`, persisted in localStorage `serdaros-admin-lang`, default `tr`). The login card has the same switch. Every UI string goes through `t()`.
- Look: match the site palette (dark greens #163e2e #1d3324 #244b37, sage #9fbf7f #8ccf88, cream #f8f8ec #fffce9 #eef0d6, borders #a9b994, accents #c9a45c #b5523b; Tahoma/Verdana UI, VT323 for headings via the Google Fonts link already in root layout, Courier New for code), but airy and modern: cream content area, rounded 6px cards, subtle borders, comfortable spacing, readable 14px inputs, visible focus rings, responsive (sidebar collapses to a top select on narrow screens). Accessible labels for every input.
- Validation: required slug unique per list (kebab-case), title; warn inline, block save if invalid with a toast pointing to the field.
