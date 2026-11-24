/* SerdarOS 96 — kişisel içerik. Siteyi kişiselleştirmek için yalnızca bu dosyayı düzenle. */

export interface ContentFile { title: string; text: string }
/** `slug` links to the long-form detail page in lib/projects/<slug>.ts (text + images). */
export interface Project { slug: string; name: string; icon: string; desc: string; tech: string; link: string }
export interface Folder { title: string; items: string[]; empty?: string }
export interface Photo { src: string; caption: string }
export interface Content {
  owner: {
    name: string; shortName: string; os: string; edition: string; tagline: string;
    location: string; email: string; github: string; instagram: string; linkedin: string; photo: string;
    wallpaper: string;
  };
  desktopIcons: string[];
  startMenu: string[];
  files: Record<string, ContentFile>;
  projects: Project[];
  folders: Record<string, Folder>;
  photos: Photo[];
  avatars: string[];
}

export const CONTENT: Content = {
  owner: {
    name: "Serdar Kerez",
    shortName: "Serdar",
    os: "SerdarOS 96",
    edition: "Personal Edition",
    tagline: "Bilgisayar Programcılığı öğrencisi · Veri Mühendisliği yolunda",
    location: "Antalya / Trabzon, Türkiye",
    email: "serdarkerez.61@gmail.com",
    github: "https://github.com/SerdarKerez",
    instagram: "https://www.instagram.com/mr.noggersengor",
    linkedin: "",                            // varsa LinkedIn linkin
    photo: "/vesikalik.jpg",                 // About Me.txt'teki vesikalık
    wallpaper: "/wallpaper.jpg"              // varsayılan masaüstü arka planı
  },

  desktopIcons: ["computer", "projects", "about", "recycle", "calculator", "photos", "mail", "games", "notes", "welcome"],
  startMenu: ["notes", "help", "computer", "games", "calculator", "photos", "mail", "profile", "restart"],

  files: {
    about: {
      title: "Hakkımda.txt",
      text:
`Merhaba, ben Serdar Kerez.

Akdeniz Üniversitesi'nde Bilgisayar Programcılığı (ön lisans) okuyorum.
Hedefim Veri Mühendisliği alanında uzmanlaşmak: veriyi toplamak,
temizlemek, taşımak ve anlamlı hale getirmek.

--- Diller ---
Python, C#, Delphi (Object Pascal), JavaScript, SQL (MSSQL)

--- Araçlar ---
VS Code, PyCharm, Delphi 7, SSMS, Photoshop, Adobe Animate

--- Üretken AI & medya ---
UGC reklamlar, sentetik karakterler ve enstrümantal ses üretiyorum.
Magnific AI, Freepik AI, Seedance, Kling kullanıyor; kurguyu CapCut'ta yapıyorum.

--- Boş zaman ---
Elektro gitar çalıyorum (D Standard). Metallica, Gojira, Pantera, Rammstein,
2L8, Fairuz, Erkan Oğur, Eric Clapton dinliyorum.
Bilimkurgu, distopya ve çizgi roman okuyorum: Watchmen, Vakıf,
Doktor Moreau'nun Adası, C. M. Kösemen.

SerdarOS 96'ya hoş geldin. Etrafı kurcalamaktan çekinme!`
    },
    welcome: {
      title: "Hoş Geldin.txt",
      text:
`SerdarOS 96 — Personal Edition

Bu site, kişisel portfolyomun 90'lar sonu bir masaüstü işletim sistemi
olarak hayal edilmiş hali.

Nasıl kullanılır:
 • Masaüstü ikonlarına çift tıkla.
 • Pencereleri başlık çubuğundan sürükle, köşelerinden boyutlandır.
 • Sol alttaki "start" menüsünü keşfet.
 • Masaüstüne sağ tıkla.
 • Games klasöründe birkaç küçük oyun var.
 • Blog ikonunda yazılarımı okuyabilirsin.

İyi eğlenceler!  — Serdar`
    },
    copyright: {
      title: "Telif Hakkı.txt",
      text: `© ${new Date().getFullYear()} Serdar Kerez. Tüm hakları saklıdır.\nSerdarOS 96 hayali bir işletim sistemidir.`
    },
    privacy: {
      title: "Gizlilik.txt",
      text: `Bu site çerez kullanmaz. Notların ve ayarların yalnızca tarayıcının localStorage alanında tutulur.`
    }
  },

  projects: [
    {
      slug: "anket-portali",
      name: "Anket Portalı",
      icon: "folder",
      desc: "Çevrimiçi anket oluşturma ve yanıt toplama portalı.",
      tech: "C# · ASP.NET · MSSQL",
      link: ""
    },
    {
      slug: "genomik-crm",
      name: "Genomik CRM",
      icon: "folder",
      desc: "Ham DNA verisi analizi yapan genomik CRM platformu konsepti.",
      tech: "Python · SQL · Parquet",
      link: ""
    },
    {
      slug: "veri-bilimi",
      name: "Veri Bilimi Projeleri",
      icon: "folder",
      desc: "Sistem Analizi ve Tasarımı I dersi kapsamında GitHub'daki veri bilimi çalışmaları.",
      tech: "Python · NumPy · pandas · Seaborn",
      link: "https://github.com/SerdarKerez/turkcell-veri-bilimi"
    }
  ],

  folders: {
    computer: { title: "Bilgisayarım", items: ["projects", "notes", "games", "welcome", "about", "copyright", "privacy", "calculator", "photos", "mail", "recycle"] },
    games:    { title: "Oyunlar", items: ["snake", "mines", "stack"] },
    recycle:  { title: "Geri Dönüşüm Kutusu", items: [], empty: "Geri dönüşüm kutusu boş." }
  },

  /* Fotoğraflar: public/gallery/ klasörüne koy ve buraya ekle. Liste boşsa Gallery penceresi örnek renk kartları gösterir. */
  photos: [
    { src: "/gallery/budapest.jpg", caption: "Budapeşte'den manzara" },
    { src: "/gallery/kilise.jpg", caption: "Barok bir kilisenin içi" },
    { src: "/gallery/spor-salonu.jpg", caption: "Antrenman sonrası" },
    { src: "/gallery/arkadaslar-1.jpg", caption: "Arkadaşlarla" },
    { src: "/gallery/arkadaslar-2.jpg", caption: "Yolda, arabada" },
    { src: "/gallery/kirpi.jpg", caption: "Yapraklı kirpi" }
  ],

  avatars: ["guitar", "cat", "robot", "skull", "planet", "dna"]
};
