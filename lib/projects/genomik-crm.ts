import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "genomik-crm",
  status: "Konsept",
  role: "Tasarım & mimari",
  period: "2026",
  cover: "/projects/genomik-crm/cover.svg",
  coverAlt: "Retro CRT ekranında DNA sarmalı, müşteri kartı ve veri hattı simgeleri, üstünde 'Genomik CRM' başlığı",
  highlights: [
    "Ham DNA dosyası yükleme, ayrıştırma ve kalite kontrolünü müşteri kaydıyla birleştiren platform konsepti",
    "Kromozoma göre bölümlenmiş Parquet + SQL'deki CRM tabloları ile katmanlı veri mimarisi",
    "Rıza, şifreleme ve silme hakkı en baştan tasarıma gömülü (KVKK / GDPR)",
    "Teşhis iddiası yok: raporlar bilgilendirme amaçlı ve doğrulama uyarılı",
  ],
  blocks: [
    {
      type: "p",
      text: "Genomik CRM, üzerinde düşündüğüm bir **ürün ve mimari konsepti**: müşterilerin tüketici DNA testlerinden indirdiği ham dosyaları yükleyebildiği, platformun bu dosyaları ayrıştırıp anotasyonladığı, varyantları sınıflandırdığı ve tüm bunları bir müşteri ilişkileri sistemiyle birleştirdiği bir yapı. Henüz çalışan bir ürün değil; bu sayfa, problemi nasıl tanımladığımı ve sistemi nasıl kurgulayacağımı anlatıyor.",
    },
    {
      type: "note",
      text: "**Önemli:** Genomik CRM bir konsepttir; tıbbi cihaz değildir ve tanı koymaz. Tasarladığım raporlar yalnızca bilgilendirme amaçlıdır. Sağlıkla ilgili her bulgu klinik bir laboratuvarda doğrulanmalı ve bir hekim ya da genetik danışmanla değerlendirilmelidir.",
    },
    { type: "h", text: "Problem" },
    {
      type: "p",
      text: "Ham DNA dosyası indirmek kolay, onu anlamlı ve güvenli şekilde yönetmek zor. Bu veriyle çalışmak isteyebilecek bir ekip, örneğin varsayımsal olarak bir **beslenme/wellness kliniği** ya da bir **genetik danışman**, bugün dosyaları e-postayla alıp elle işlemek, rızaları kâğıtta tutmak ve raporları dağınık klasörlerde saklamak zorunda kalabilir. Benim sorum şuydu: müşteri kaydı, rıza, dosya işleme ve rapor aynı veri modelinde buluşursa ne olur?",
    },
    { type: "h", text: "Hedef kullanıcılar (varsayımsal)" },
    {
      type: "list",
      items: [
        "**Danışman / uzman:** müşteri kartını, yüklenen dosyaların durumunu ve rapor taslaklarını tek ekranda görür.",
        "**Müşteri:** dosyasını güvenli şekilde yükler, rızalarını kendisi yönetir, raporunu indirir ya da verisinin silinmesini ister.",
        "**Yönetici:** erişim kayıtlarını (audit log) ve saklama sürelerini izler.",
      ],
    },
    { type: "h", text: "Temel modüller" },
    {
      type: "table",
      head: ["Modül", "Görevi", "Veri / teknoloji"],
      rows: [
        ["CRM kayıtları", "Müşteri, randevu, not ve rapor geçmişi", "SQL (MSSQL / PostgreSQL)"],
        ["Güvenli yükleme", "Şifreli aktarım, boyut ve format kontrolü", "Nesne depolama, imzalı URL"],
        ["Ayrıştırma & QC", "Sağlayıcı formatını normalize etme, call rate, no-call", "Python, pandas"],
        ["Anotasyon", "dbSNP, ClinVar, gnomAD ile sürümlü zenginleştirme", "Parquet, sürümlü referans tablolar"],
        ["Rapor üretimi", "Rızaya göre filtrelenmiş, uyarılı rapor", "Şablon + PDF"],
        ["Rıza yönetimi", "Kapsam bazlı, geri alınabilir onaylar", "SQL, olay kaydı"],
      ],
    },
    {
      type: "p",
      text: "Dosya formatı, referans genom sürümleri, kalite kontrol ve sınıflandırma detaylarını burada tekrar etmiyorum; bunları Blog'daki **'Ham DNA Verisini Sınıflandırmak ve Haritalandırmak'** yazısında adım adım anlattım. Bu sayfa daha çok bu adımların bir ürünün içinde nasıl yer alacağına odaklanıyor.",
    },
    { type: "img", src: "/projects/genomik-crm/architecture.svg", alt: "Yükleme, nesne depolama, işleme hattı, kromozoma göre bölümlenmiş Parquet, veri ambarı ve SQL CRM tablolarını gösteren sistem mimarisi şeması", caption: "Kurguladığım sistem mimarisi: genomik veri ve CRM verisi ayrı katmanlarda, ortak bir örnek kimliğiyle bağlı." },
    { type: "h", text: "Veri mimarisi" },
    {
      type: "p",
      text: "Yüklenen dosya önce şifreli olarak **nesne depolamaya** düşer. İşleme hattı dosyayı okur, normalize eder ve sonucu **kromozoma göre bölümlenmiş Parquet** olarak yazar; buradan analitik sorgular için bir **veri ambarına** aktarılır. CRM tarafı (müşteri, rıza, rapor, erişim kaydı) ise ilişkisel **SQL** tablolarında durur. İki dünyayı bağlayan tek şey, kimlik bilgisi içermeyen bir `sample_id`. Ad, e-posta gibi bilgiler genomik katmana hiç inmez.",
    },
    {
      type: "p",
      text: "Rapor üretilirken her sorgu rıza tablosundan geçer. Örneğin farmakogenomik bölümü yalnızca o kapsama aktif rızası olan örnekler için çalışır:",
    },
    {
      type: "code",
      lang: "sql",
      code: `-- Yalnızca 'pgx' kapsamında aktif rızası olan örnekleri rapora al
SELECT s.sample_id, v.rsid, v.genotype, a.gene, a.category
FROM crm.samples AS s
JOIN crm.consents AS c
  ON c.customer_id = s.customer_id
 AND c.scope = 'pgx'
 AND c.granted_at IS NOT NULL
 AND c.revoked_at IS NULL
JOIN dw.variants AS v
  ON v.sample_id = s.sample_id
JOIN dw.annotations AS a
  ON a.rsid = v.rsid
 AND a.db_version = @annotation_version
WHERE s.deleted_at IS NULL;`,
    },
    { type: "img", src: "/projects/genomik-crm/customer-card.svg", alt: "Örnek Müşteri adlı kurgusal bir kişinin müşteri kartı ekran taslağı: rıza durumları, dosya durumu ve rapor listesi", caption: "Müşteri kartı taslağı. Kişi ve tüm değerler kurgusaldır." },
    { type: "h", text: "Gizlilik ve etik, tasarımın parçası olarak" },
    {
      type: "list",
      items: [
        "**Şifreleme:** aktarımda TLS, depoda şifreli nesneler; anahtarlar uygulama verisinden ayrı yönetilir.",
        "**Rıza:** kapsam bazlı (işleme, rapor, farmakogenomik, araştırma) ve her an geri alınabilir; her değişiklik olay olarak kaydedilir.",
        "**En az veri:** genomik katmanda yalnızca `sample_id`; ham dosya işlendikten sonra belirlenen süre sonunda silinir.",
        "**Silme hakkı:** tek bir istek; CRM kaydı, Parquet bölümleri, ambar satırları ve yedeklerdeki kopyalar için silme işi tetikler.",
        "**Teşhis iddiası yok:** klinik etiketler sonuç gibi değil, 'doğrulama gerektirir' uyarısıyla gösterilir.",
      ],
    },
    { type: "img", src: "/projects/genomik-crm/consent-flow.svg", alt: "Rıza verme, işleme, rapor, rıza geri alma ve silme adımlarını gösteren veri akışı diyagramı", caption: "Rıza ve veri akışı: rıza geri alındığında ya da silme istendiğinde hattın hangi katmanları etkilenir." },
    { type: "h", text: "Yol haritası" },
    {
      type: "list",
      ordered: true,
      items: [
        "CRM ve rıza tablolarının SQL şemasını yazmak, örnek (sentetik) veriyle test etmek.",
        "Ayrıştırma ve QC adımını bağımsız bir Python modülü hâline getirmek.",
        "Parquet bölümleme ve sürümlü anotasyon tablolarını küçük bir ETL hattında birleştirmek.",
        "Rızaya duyarlı rapor şablonunu ve silme iş akışını prototiplemek.",
        "Hukuki ve etik değerlendirme olmadan gerçek kullanıcı verisiyle çalışmamak.",
      ],
    },
  ],
};
