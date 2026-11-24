"use client";
/* Help window (Turkish usage guide). App: help. */
import { useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { getContent } from "@/lib/content-i18n";
import { useLang, type Lang } from "@/lib/i18n";
import { label } from "@/lib/labels";
import { useOS } from "@/components/os/OSContext";
import { iconSvg, SvgSpan } from "./shared";

interface Topic {
  id: string;
  title: string;
  icon: string;
  body?: string[];
  keys?: [string, string][];
  actions?: [string, string][];
}

type T = (tr: string, en: string) => string;

function topics(t: T, shortName: string, lang: Lang): Topic[] {
  const lbl = (id: string) => label(id, lang) || id;
  return [
    { id: "start", title: t("Başlarken", "Getting started"), icon: "computer", body: [
      t("SerdarOS 96, " + shortName + "'ın kişisel portfolyosu; 90'ların sonundan kalma bir masaüstü gibi tasarlandı.",
        "SerdarOS 96 is " + shortName + "'s personal portfolio, designed like a desktop from the late '90s."),
      t("Masaüstündeki bir ikona çift tıkla ya da seçip Enter'a bas. Tek tık yalnızca seçer.",
        "Double-click an icon on the desktop, or select it and press Enter. A single click only selects it."),
      t("Sol alttaki start düğmesi tüm uygulamaları, notları ve profil ayarlarını açar.",
        "The start button in the bottom-left corner opens every app, the notes and your profile settings."),
    ], actions: [[lbl("welcome"), "welcome"], [lbl("about"), "about"]] },
    { id: "windows", title: t("Pencereler", "Windows"), icon: "folder", body: [
      t("Pencereyi başlık çubuğundan sürükle. Kenar ve köşelerinden boyutlandırabilirsin.",
        "Drag a window by its title bar. Resize it from its edges and corners."),
      t("Başlık çubuğuna çift tıklamak pencereyi büyütür ya da eski boyutuna döndürür.",
        "Double-clicking the title bar maximizes the window or restores its previous size."),
      t("[_] küçültür, [□] büyütür, [×] kapatır. Küçültülen pencereler görev çubuğundan geri gelir.",
        "[_] minimizes, [□] maximizes, [×] closes. Minimized windows come back from the taskbar."),
      t("Görev çubuğunun sağındaki bilgisayar düğmesi tüm pencereleri gizleyip masaüstünü gösterir.",
        "The computer button on the right of the taskbar hides every window and shows the desktop."),
    ] },
    { id: "desktop", title: t("Masaüstü", "Desktop"), icon: "computer", body: [
      t("Masaüstüne sağ tıkla: yeni not, blog ve yardım burada.",
        "Right-click the desktop for a new note, the blog and help."),
      t("İkonları sürükleyerek yerlerini değiştirebilirsin; tarayıcı konumlarını hatırlar.",
        "Drag icons to rearrange them; your browser remembers where you put them."),
      t("Saat düğmesine tıklarsan küçük bir takvim açılır.", "Click the clock to open a small calendar."),
    ] },
    { id: "notes", title: t("Blog, notlar ve SerdarPad", "Blog, notes and SerdarPad"), icon: "notes", body: [
      t("Blog penceresinde yazılarımı okuyabilirsin. Bir karta tıkla; üstteki oklarla yazılar arasında gezin.",
        "Read my posts in the Blog window. Click a card, then use the arrows at the top to move between posts."),
      t("Metin dosyaları SerdarPad'de açılır. Düzenlenebilir dosyalarda Ctrl+S ile kaydet.",
        "Text files open in SerdarPad. Press Ctrl+S to save editable files."),
      t("Dosya adını değiştirip kaydedersen yeni bir not oluşur; notların Bilgisayarım klasöründe listelenir.",
        "Change the file name and save to create a new note; your notes are listed in the My Computer folder."),
      t("Silinen notlar Geri Dönüşüm Kutusu'na gider; oradan geri yükleyebilir ya da kalıcı olarak silebilirsin.",
        "Deleted notes go to the Recycle Bin, where you can restore them or delete them permanently."),
      t("Ctrl+F ile metin içinde arama yapabilir, Edit menüsünden sözcük kaydırmayı açıp kapatabilirsin.",
        "Search the text with Ctrl+F, and toggle word wrap from the Edit menu."),
    ], actions: [[t("Yeni not", "New note"), "notepad"], ["Blog", "notes"]] },
    { id: "projects", title: t("Projeler", "Projects"), icon: "folder", body: [
      t("Projelerim klasöründe üzerinde çalıştığım projeler var. Bir projeye çift tıklayınca açıklaması, kullandığım teknolojiler ve bağlantısı açılır.",
        "The My Projects folder holds the projects I'm working on. Double-click one to see its description, the technologies I used and its link."),
    ], actions: [[lbl("projects"), "projects"]] },
    { id: "photos", title: t("Fotoğraflar", "Photos"), icon: "photos", body: [
      t("Galeri penceresinde bir fotoğrafa tıkla; görüntüleyicide ← ve → tuşlarıyla gezin.",
        "Click a photo in the Gallery window; use ← and → to browse in the viewer."),
    ], actions: [[lbl("photos"), "photos"]] },
    { id: "mail", title: t("İletişim", "Contact Me"), icon: "mail", body: [
      t("İletişim penceresinden bana mesaj yazabilirsin; e-posta adresim, GitHub ve Instagram hesaplarım da orada. Gönder'e basınca kendi e-posta uygulaman hazır bir mesajla açılır.",
        "Write to me from the Contact Me window; my email address, GitHub and Instagram are there too. When you press Send, your own email app opens with the message ready to go."),
      t("Site hiçbir veriyi sunucuya göndermez; taslağın yalnızca bu tarayıcıda saklanır.",
        "The site never sends any data to a server; your draft is only kept in this browser."),
    ], actions: [[lbl("mail"), "mail"]] },
    { id: "games", title: t("Oyunlar", "Games"), icon: "games", body: [
      t("Oyunlar klasöründe Snake, Mayın Tarlası ve Stack var. Pencere odağını kaybedince oyunlar duraklar.",
        "The Games folder has Snake, Minesweeper and Stack. Games pause when their window loses focus."),
    ], actions: [[lbl("games"), "games"]] },
    { id: "profile", title: t("Misafir profili", "Guest profile"), icon: "user", body: [
      t("Misafir profili penceresinden bir avatar seçip adını yazabilirsin. Profilin yalnızca bu cihazda tutulur.",
        "Pick an avatar and enter your name in the Guest profile window. Your profile is only kept on this device."),
      t("Aynı pencereden tüm verileri sıfırlayıp temiz bir başlangıç yapabilirsin.",
        "From the same window you can reset all data and start fresh."),
    ], actions: [[lbl("profile"), "profile"]] },
    { id: "keys", title: t("Klavye kısayolları", "Keyboard shortcuts"), icon: "text", keys: [
      ["Enter", t("Seçili ikonu aç", "Open the selected icon")],
      [t("Ok tuşları", "Arrow keys"), t("Seçili ikonu taşı / fotoğraflar arasında gez", "Move the selected icon / browse photos")],
      ["Ctrl+S", t("SerdarPad'de kaydet", "Save in SerdarPad")], ["Ctrl+F", t("SerdarPad'de bul", "Find in SerdarPad")],
      ["Esc", t("Menüleri ve açılır pencereleri kapat", "Close menus and pop-ups")],
      ["Shift+F10", t("Masaüstü menüsünü aç", "Open the desktop menu")],
    ] },
  ];
}

export default function Help({ winId }: AppProps) {
  const os = useOS();
  const { lang, t } = useLang();
  const O = getContent(lang).owner;
  const shortName = O.shortName || "Serdar";
  const TOPICS = topics(t, shortName, lang);
  const [current, setCurrent] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const secRefs = useRef<Record<string, HTMLElement | null>>({});
  const osName = O.os || "SerdarOS 96";

  function goTo(id: string) {
    setCurrent(id);
    const sec = secRefs.current[id];
    if (!sec || !mainRef.current) return;
    mainRef.current.scrollTo({ top: sec.offsetTop - 8, behavior: "smooth" });
    sec.focus({ preventScroll: true });
  }

  return (
    <div className="help-app">
      <div className="help-app__layout">
        <nav className="help-app__nav" aria-label={t("Yardım konuları", "Help topics")}>
          {TOPICS.map((t) => (
            <button key={t.id} type="button" aria-current={current === t.id ? "true" : undefined} onClick={() => goTo(t.id)}>
              <SvgSpan hidden svg={iconSvg(t.icon)} />
              {t.title}
            </button>
          ))}
        </nav>
        <div className="help-app__main" ref={mainRef}>
          <header className="help-app__header">
            <SvgSpan className="help-app__header-icon" hidden svg={iconSvg("help")} />
            <div>
              <p className="help-app__eyebrow">{t("Yardım ve destek", "Help and support")}</p>
              <h3>{t(osName + " nasıl kullanılır?", "How to use " + osName)}</h3>
              <p>{t("Kısa bir rehber. Bir konuya tıkla ya da aşağı kaydır.", "A short guide. Click a topic or scroll down.")}</p>
            </div>
          </header>
          {TOPICS.map((t) => (
            <section
              key={t.id}
              className="help-app__topic"
              id={"help-" + t.id + "-" + winId}
              tabIndex={-1}
              ref={(el) => { secRefs.current[t.id] = el; }}
            >
              <h4>
                <SvgSpan className="help-app__topic-icon" hidden svg={iconSvg(t.icon)} />
                {t.title}
              </h4>
              {t.body && (
                <ul>
                  {t.body.map((p) => <li key={p}>{p}</li>)}
                </ul>
              )}
              {t.keys && (
                <dl className="help-app__keys">
                  {t.keys.flatMap(([k, d]) => [
                    <dt key={k + "-t"}><kbd>{k}</kbd></dt>,
                    <dd key={k + "-d"}>{d}</dd>,
                  ])}
                </dl>
              )}
              {t.actions && (
                <div className="help-app__actions">
                  {t.actions.map(([label, app]) => (
                    <button key={app} type="button" onClick={() => os.openApp(app)}>{label + " →"}</button>
                  ))}
                </div>
              )}
            </section>
          ))}
          <p className="help-app__footer-note">{t("Hâlâ takıldın mı? İletişim penceresinden bana yazabilirsin. — ", "Still stuck? Write to me from the Contact Me window. — ") + shortName}</p>
        </div>
      </div>
      <div className="file-browser__status">
        <span>{TOPICS.length + t(" konu", " topics")}</span>
        <span>{osName + t(" Yardım", " Help")}</span>
      </div>
    </div>
  );
}
