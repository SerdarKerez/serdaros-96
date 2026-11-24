import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "veri-bilimi",
  status: "Tamamlandı / sürüyor",
  role: "Ders projesi",
  period: "2025 – 2026",
  cover: "/projects/veri-bilimi/cover.svg",
  coverAlt:
    "Retro CRT ekranında pandas tablosu, kutu grafiği ve 'Veri Bilimi Projeleri' başlığı",
  highlights: [
    "Sistem Analizi ve Tasarımı I dersi için hazırlanan Python çalışmaları",
    "Üç modül: Veri Manipülasyonu 101, Veri Manipülasyonu 201 ve Veri Ön İşleme",
    "NumPy, pandas, Seaborn, missingno ve scikit-learn ile pratik",
    "Kodlar ve dört eğitim sertifikası GitHub'da açık",
  ],
  blocks: [
    {
      type: "p",
      text: "Bu proje, **Sistem Analizi ve Tasarımı I** dersi kapsamında yaptığım veri bilimi çalışmalarının toplandığı yer. Kodların hepsi GitHub'daki `turkcell-veri-bilimi` deposunda duruyor. Amaç büyük bir model kurmak değildi. Asıl hedef, veri mühendisliğine giden yolun temelini oturtmaktı: veriyi okumak, şekillendirmek, eksiğini ve aykırısını görmek, sonra modele hazır hale getirmek.",
    },
    {
      type: "note",
      text: "Depo: github.com/SerdarKerez/turkcell-veri-bilimi — tüm profil: github.com/SerdarKerez",
    },
    { type: "h", text: "Depoda neler var?" },
    {
      type: "p",
      text: "Çalışmalar üç klasöre bölünmüş durumda. Her klasör bir eğitim modülüne karşılık geliyor ve her modülün sertifikası `Sertifikalar/` klasöründe. Toplam dört sertifika var: Veri Okuryazarlığı, Veri Manipülasyonu 101, Veri Manipülasyonu 201 ve Veri Ön İşleme.",
    },
    {
      type: "table",
      head: ["Klasör", "Dosyalar", "Konu"],
      rows: [
        ["veri_manipülasyonu_101", "numpy_giris.py, eleman_islemleri.py, matematiksel_islemler.py", "NumPy array oluşturma, reshape, concatenate, split, sort"],
        ["veri_manipülasyonu_201", "pandas_serileri.py, pandas_dataframe.py, gruplama_ve_toplulastirma.py", "Series/DataFrame, loc–iloc, merge, groupby, pivot_table"],
        ["veri_ön_işleme", "eksik_gozlem.py, aykiri_gozlem_analiz.py, degisken_standardizasyon.py", "Eksik veri, aykırı gözlem, ölçekleme ve kodlama"],
      ],
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/workflow.svg",
      alt: "Ham veriden modele hazır veriye uzanan adımlar: okuma, manipülasyon, eksik veri, aykırı gözlem, dönüşüm",
      caption: "Depodaki üç modül, bir veri hazırlama akışının ardışık adımlarına denk geliyor.",
    },
    { type: "h", text: "Veri manipülasyonu: NumPy ve pandas" },
    {
      type: "p",
      text: "İlk modülde NumPy'ın temellerini çalıştım: `np.zeros`, `np.arange`, `reshape`, iki boyutta `concatenate` ve `vsplit`/`hsplit`. `np.sort(v)` ile `v.sort()` arasındaki fark gibi küçük ama önemli detayları kod yorumlarına not ettim. Biri orijinal diziyi korur, diğeri yerinde değiştirir.",
    },
    {
      type: "p",
      text: "İkinci modülde pandas'a geçtim. Seaborn'un hazır `planets` ve `titanic` veri setleriyle `groupby`, `aggregate`, `filter`, `transform`, `apply` ve `pivot_table` denedim. Bu adımları SQL'deki `GROUP BY` ve `JOIN` mantığıyla eşleştirmek, MSSQL tarafındaki bilgimi pekiştirdi. `pd.merge` ile çalışan ve departman tablolarını birleştirmek, ilişkisel tasarımın doğrudan karşılığıydı.",
    },
    { type: "h", text: "Veri ön işleme: eksik, aykırı, ölçek" },
    {
      type: "p",
      text: "En çok vakit harcadığım bölüm bu oldu. Eksik veri için `isnull().sum()` ile sayım, `dropna` seçenekleri, ortalama, medyan ve mod ile doldurma yaptım. Departman kırılımında grup ortalamasıyla atama ve KNN tabanlı tahmine dayalı atama da var. Eksikliğin yapısını `missingno` ile bar, matris ve ısı haritası olarak görselleştirdim.",
    },
    {
      type: "p",
      text: "Aykırı gözlemler için `diamonds` veri setinde **IQR yöntemiyle** alt ve üst sınır hesapladım. Sonra üç çözümü karşılaştırdım: silme, ortalama ile doldurma ve baskılama. Çok değişkenli tarafta scikit-learn'deki `LocalOutlierFactor` ile LOF skorlarına göre eşik belirledim.",
    },
    {
      type: "code",
      lang: "python",
      code: `Q1 = df_table.quantile(0.25)
Q3 = df_table.quantile(0.75)
IQR = Q3 - Q1

alt_sinir = Q1 - 1.5 * IQR
ust_sinir = Q3 + 1.5 * IQR

# Baskılama: sınır dışını sınıra çek
df_baskilama = df["table"].copy()
df_baskilama[df_baskilama < alt_sinir] = alt_sinir
df_baskilama[df_baskilama > ust_sinir] = ust_sinir`,
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/editor.svg",
      alt: "Retro editör penceresinde IQR kodu ve yanında örnek veriyle çizilmiş kutu grafiği",
      caption: "IQR ile aykırı değer yakalama. Grafikteki değerler temsilidir (örnek veri).",
    },
    {
      type: "p",
      text: "Son dosyada değişken dönüşümleri var: `preprocessing.scale` ile standardizasyon, `normalize`, 10–20 aralığına `MinMaxScaler`, `LabelEncoder` ile 0-1 kodlama ve `get_dummies` ile one-hot dönüşüm. Dummy değişken tuzağını da burada öğrendim.",
    },
    { type: "h", text: "Sistem analiziyle bağlantısı" },
    {
      type: "p",
      text: "Bu çalışmaları bir sistem analizi dersinde yapmak ilk başta garip gelebilir, ama bağlantı net. Bir sistemi analiz ederken **gereksinimleri**, **veri akış diyagramlarını (DFD)** ve **kullanım durumlarını** çıkarıyoruz. DFD'deki her süreç aslında bir veri dönüşümü, her veri deposu da bir tablo. Eksik ve aykırı veriyi temizlemek, analizin \"veri kalitesi\" gereksinimini karşılamak demek.",
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/dfd.svg",
      alt: "Analist aktörü, ham veri deposu, temizleme ve dönüşüm süreçleri ile temiz veri deposunu gösteren veri akış diyagramı",
      caption: "Veri hazırlama akışının basit bir DFD gösterimi: süreçler dönüşüm, depolar tablo.",
    },
    { type: "h", text: "Araçlar" },
    {
      type: "list",
      items: [
        "**Python** ile `.py` betikleri, geliştirme ortamı **PyCharm**",
        "**NumPy** ve **pandas**: veri yapıları ve manipülasyon",
        "**Seaborn**, **Matplotlib** ve **missingno**: görselleştirme ve hazır veri setleri",
        "**scikit-learn**: LOF, ölçekleme ve kodlama",
        "**Git / GitHub**: sürüm takibi ve paylaşım",
      ],
    },
    { type: "h", text: "Neler öğrendim?" },
    {
      type: "list",
      items: [
        "Modelden önce verinin şekli ve kalitesi gelir. İşin çoğu hazırlık aşamasında.",
        "Eksik veriyi silmek kolay ama bilgi kaybettirir. Grup bazlı veya tahmine dayalı atama çoğu zaman daha iyi.",
        "Aykırı değer her zaman hata değildir. Silmek, doldurmak ve baskılamak farklı sonuçlar doğurur.",
        "`inplace` ve kopya (`.copy()`) farkı, sessiz hataların önemli bir kaynağı.",
      ],
    },
    { type: "h", text: "Sonraki adımlar" },
    {
      type: "list",
      items: [
        "Hazırlanan veriyle scikit-learn'de basit regresyon ve sınıflandırma modelleri kurmak",
        "Tekrarlanan temizleme adımlarını fonksiyonlara ve `Pipeline` yapısına taşımak",
        "Sonuçları SQL veritabanına yazıp küçük bir ETL akışı kurmak",
        "Her modül için README'ye çıktılar ve kısa açıklamalar eklemek",
      ],
    },
  ],
};
