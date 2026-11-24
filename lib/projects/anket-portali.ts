import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "anket-portali",
  status: "Geliştiriliyor",
  role: "Tek geliştirici",
  period: "2025 – devam ediyor",
  cover: "/projects/anket-portali/cover.svg",
  coverAlt: "Retro CRT ekranında ANKET PORTALI başlığı, yanında soru kutuları ve küçük bir çubuk grafik",
  highlights: [
    "Anket oluşturma, paylaşılabilir bağlantı ve yanıt toplama",
    "C# katmanlı mimari ve ilişkisel MSSQL şeması",
    "Sonuçları T-SQL ile özetleyen grafikli sonuç ekranı",
    "Veri mühendisliğine giden yolda bir SQL laboratuvarı",
  ],
  blocks: [
    { type: "h", text: "Neden bu proje?" },
    {
      type: "p",
      text: "Anket portalı, insanların çevrimiçi anket oluşturup yanıt toplayabildiği bir web uygulaması. Fikir basit ama içinde öğrenmek istediğim her şey var: ilişkisel veri modeli, kullanıcıdan gelen verinin doğrulanması, yanıtların **SQL ile özetlenmesi** ve sonuçların okunabilir bir ekranda gösterilmesi. Projeyi **C#** ve **MSSQL** ile tek başıma geliştiriyorum; hedefim hem çalışan bir ürün hem de veri mühendisliğine hazırlık için kendi küçük veri laboratuvarım.",
    },
    {
      type: "note",
      text: "Proje hâlâ geliştirme aşamasında. Aşağıdaki özellik listesi bir kısmı yapılmış, bir kısmı planlanmış bir tasarımı anlatıyor; ekran görüntüleri gerçek ekranlar değil, tasarım çizimleri.",
    },
    { type: "h", text: "Hedefler" },
    {
      type: "list",
      items: [
        "Teknik bilgisi olmayan birinin birkaç dakikada anket hazırlayabilmesi",
        "Yanıtların tutarlı, sorgulanabilir bir şemada saklanması",
        "Sonuçların grafikle özetlenmesi ve ham verinin dışa aktarılabilmesi",
        "Kod tarafında katmanları ayırıp test edilebilir bir yapı kurmak",
      ],
    },
    { type: "h", text: "Özellik seti" },
    {
      type: "list",
      items: [
        "**Anket oluşturucu:** tek seçim, çoklu seçim, kısa metin ve 1–5 puanlama soru tipleri; soruları sıralama ve zorunlu işaretleme",
        "**Paylaşılabilir bağlantı:** her anket için tahmin edilmesi zor bir kod üreten link",
        "**Yanıt toplama:** sunucu tarafında doğrulama, aynı oturumdan tekrarlı gönderime karşı basit kontrol",
        "**Sonuç ekranı:** seçenek bazlı dağılımları çubuk ve pasta grafikle gösterme",
        "**CSV dışa aktarma:** ham yanıtları Excel veya Python ile analiz için indirme",
        "**Kullanıcı rolleri:** yönetici, anket sahibi ve katılımcı",
      ],
    },
    {
      type: "img",
      src: "/projects/anket-portali/builder.svg",
      alt: "Anket oluşturucu ekranının tasarım çizimi: solda soru tipleri, ortada sorular, sağda ayarlar",
      caption: "Anket oluşturucu için tasarım çizimi.",
    },
    { type: "h", text: "Mimari" },
    {
      type: "p",
      text: "Uygulamayı **ASP.NET** üzerinde katmanlı kurguluyorum: sunum katmanı (sayfalar ve formlar), iş kuralları katmanı (doğrulama, yetki, anket durumu) ve veri erişim katmanı. Veri erişimi parametreli sorgularla yapılıyor; SQL enjeksiyonuna karşı kullanıcı girdisini hiçbir zaman sorgu metnine eklemiyorum. Özet hesaplamaları mümkün olduğunca veritabanında, T-SQL ile yapıyorum; C# tarafı sonucu sadece ekrana taşıyor.",
    },
    { type: "h", text: "Veritabanı şeması" },
    {
      type: "table",
      head: ["Tablo", "Temel alanlar", "Açıklama"],
      rows: [
        ["Surveys", "SurveyId, OwnerId, Title, ShareCode, IsOpen, CreatedAt", "Anketin kendisi ve paylaşım kodu"],
        ["Questions", "QuestionId, SurveyId, Text, QType, SortOrder, IsRequired", "Ankete bağlı sorular"],
        ["Options", "OptionId, QuestionId, Text, SortOrder", "Seçmeli sorulardaki seçenekler"],
        ["Responses", "ResponseId, SurveyId, SubmittedAt", "Bir katılımcının tek gönderimi"],
        ["Answers", "AnswerId, ResponseId, QuestionId, OptionId, TextValue", "Gönderimdeki her soruya verilen cevap"],
      ],
    },
    {
      type: "img",
      src: "/projects/anket-portali/er-diagram.svg",
      alt: "Surveys, Questions, Options, Responses ve Answers tablolarının ilişkilerini gösteren ER diyagramı",
      caption: "Beş tablolu ilişkisel şema; Answers hem Responses hem Questions tablosuna bağlanıyor.",
    },
    {
      type: "p",
      text: "Sonuç ekranındaki dağılımı tek sorguyla alıyorum. `LEFT JOIN` sayesinde hiç seçilmemiş seçenekler de sıfırla listeleniyor, yüzdeyi ise pencere fonksiyonu hesaplıyor:",
    },
    {
      type: "code",
      lang: "sql",
      code: `SELECT
    q.QuestionId,
    o.OptionId,
    o.Text                          AS Secenek,
    COUNT(a.AnswerId)               AS Adet,
    CAST(100.0 * COUNT(a.AnswerId)
         / NULLIF(SUM(COUNT(a.AnswerId)) OVER (PARTITION BY q.QuestionId), 0)
         AS DECIMAL(5,1))           AS Yuzde
FROM Questions q
JOIN Options o       ON o.QuestionId = q.QuestionId
LEFT JOIN Answers a  ON a.OptionId   = o.OptionId
WHERE q.SurveyId = @SurveyId
GROUP BY q.QuestionId, o.OptionId, o.Text, o.SortOrder
ORDER BY q.QuestionId, o.SortOrder;`,
    },
    {
      type: "img",
      src: "/projects/anket-portali/results.svg",
      alt: "Sonuç ekranı tasarım çizimi: örnek veriyle çubuk grafik ve pasta grafik",
      caption: "Sonuç ekranı taslağı. Grafiklerdeki sayılar örnek veridir.",
    },
    { type: "h", text: "Neler öğrendim?" },
    {
      type: "list",
      items: [
        "Şemayı önce kâğıtta çizmenin, sonradan yapılan değişikliklerden çok daha ucuz olduğunu",
        "`GROUP BY` ile pencere fonksiyonlarını birlikte kullanmayı ve `NULLIF` ile sıfıra bölmeyi önlemeyi",
        "Doğrulamayı hem istemcide hem sunucuda yapmanın neden gerekli olduğunu",
        "Katmanları ayırınca bir hatanın nerede olduğunu bulmanın kolaylaştığını",
      ],
    },
    { type: "h", text: "Sonraki adımlar" },
    {
      type: "list",
      items: [
        "Puanlama soruları için ortalama ve dağılım özetleri",
        "Sık kullanılan sorgular için indeksleri ölçerek ayarlamak",
        "Yanıtları periyodik olarak ayrı bir raporlama tablosuna aktaran küçük bir ETL adımı",
        "CSV yerine Python ile doğrudan analiz edilebilecek bir dışa aktarma seçeneği",
      ],
    },
    {
      type: "p",
      text: "Bu proje benim için bir anket uygulamasından fazlası: verinin toplanmasından özetlenmesine kadar her adımı kendim kurduğum, **veri mühendisliğine** giden yolda ilk ciddi alıştırmam.",
    },
  ],
};
