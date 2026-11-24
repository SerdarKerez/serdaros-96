import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "data-engineering-ai",
  title: "Veri Mühendisliği ve Yapay Zeka: Model, Boru Hattı Kadar İyidir",
  date: "2026-11-03",
  tags: ["veri mühendisliği", "yapay zeka", "SQL", "RAG", "kariyer"],
  cover: "/blog/data-engineering-ai/cover.svg",
  coverAlt: "Retro CRT ekranında veri boru hattından bir yapay zeka çipine akan piksel veri blokları",
  summary:
    "Yapay zekanın parlak tarafını herkes konuşuyor; ben arkasındaki veri boru hatlarını anlatıyorum. Roller, pipeline katmanları, veri kalitesi, RAG ve bir öğrenci için öğrenme yol haritası.",
  blocks: [
    {
      type: "p",
      text: "Herkes modelleri konuşuyor: hangi LLM daha akıllı, hangisi daha ucuz, hangisi daha uzun bağlam penceresine sahip. Ben ise kendi AI destekli CMS projemi geliştirirken şunu fark ettim: sorunlarımın çoğu modelden değil, **modele giden veriden** çıkıyordu. Eksik alanlar, tekrar eden kayıtlar, yanlış formatlanmış tarihler... Veri mühendisliğine yönelmek istememin sebebi de tam olarak bu. Bu yazıda yapay zekanın neden ancak veri boru hatları kadar iyi olduğunu, kendi öğrendiklerim üzerinden anlatmaya çalışacağım.",
    },
    { type: "h", text: "Üç rol, üç farklı soru" },
    {
      type: "p",
      text: "Bu alanda en çok karıştırılan şey rollerin sınırları. Kabaca şöyle ayırıyorum: **data engineer** verinin güvenilir, zamanında ve doğru şekilde bir yere ulaşmasını sağlar. **Data scientist** o veriden soru sorar, analiz yapar, model dener. **ML engineer** ise denenen modeli üretime taşır, servis eder ve izler. Gerçek şirketlerde bu sınırlar bulanıklaşır; küçük ekiplerde tek kişi üçünü birden yapabilir.",
    },
    {
      type: "table",
      head: ["Rol", "Temel soru", "Tipik araçlar"],
      rows: [
        ["Data Engineer", "Veri doğru, taze ve erişilebilir mi?", "SQL, Python, Airflow/Dagster, dbt, Spark, Kafka"],
        ["Data Scientist", "Veri bize ne söylüyor?", "Python, pandas, istatistik, notebook'lar"],
        ["ML Engineer", "Model üretimde güvenilir çalışıyor mu?", "MLflow, Docker, model serving, izleme"],
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/roles.svg",
      alt: "Veri mühendisi, veri bilimci ve ML mühendisi rollerinin kesişimini gösteren üç daireli Venn şeması",
      caption: "Roller kesişiyor ama odakları farklı: altyapı, analiz ve üretim.",
    },
    { type: "h", text: "Boru hattının katmanları" },
    {
      type: "p",
      text: "Uçtan uca bir veri boru hattı genelde beş adımdan oluşur. Her adımda bir şey ters giderse, en sondaki dashboard ya da model sessizce yanlış sonuç üretir.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Ingestion (alım):** Uygulama veritabanları, API'ler, log'lar ve dosyalardan veriyi toplamak. Batch (saatlik/günlük) ya da streaming (anlık) olabilir. CDC (change data capture) ile sadece değişen satırları almak yaygın bir yöntem.",
        "**Storage (depolama):** *Data lake* ham veriyi ucuz nesne depolamada (S3, ADLS gibi) tutar. *Data warehouse* (Snowflake, BigQuery, Redshift) yapılandırılmış, sorgulanabilir veri içindir. *Lakehouse* ise ikisini birleştirir: Delta Lake, Apache Iceberg gibi açık tablo formatlarıyla lake üzerinde ACID işlemler ve şema yönetimi sağlar.",
        "**Transformation (dönüşüm):** Klasik ETL'de veri yüklenmeden önce dönüştürülür. Modern bulut warehouse'larında ise ELT yaygın: önce ham veri yüklenir, dönüşüm warehouse içinde SQL ile yapılır. dbt bu yaklaşımın en bilinen aracı.",
        "**Orchestration (orkestrasyon):** Hangi iş ne zaman, hangi sırayla, hangi bağımlılıkla çalışacak? Airflow, Dagster, Prefect gibi araçlar bu DAG'leri yönetir, hata olunca tekrar dener ve uyarı verir.",
        "**Serving (sunum):** Temiz veri BI dashboard'larına, raporlara, ML modellerine ya da uygulamalara servis edilir.",
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/pipeline.svg",
      alt: "Kaynaklardan alım, data lake, dönüşüm, data warehouse ve BI/ML katmanlarına uzanan uçtan uca veri boru hattı şeması",
      caption: "Kaynaktan tüketiciye: her ok, bir hatanın gizlenebileceği bir yer.",
    },
    { type: "h", text: "Garbage in, garbage out" },
    {
      type: "p",
      text: "Bu söz eski ama yapay zeka çağında daha da geçerli. Bir model yanlış veriyle eğitilirse ya da yanlış bağlamla beslenirse, hatayı çok **özgüvenli** bir dille sunar. O yüzden veri kalitesi dört başlıkta düşünülmeli:",
    },
    {
      type: "list",
      items: [
        "**Validation:** Null olmaması gereken alan null mı? Fiyat negatif mi? Değer beklenen aralıkta mı? Great Expectations, dbt test'leri ya da Pandera gibi araçlar bu kuralları kod olarak yazmanı sağlar.",
        "**Schema:** Kaynak sistem bir kolonun adını ya da tipini değiştirdiğinde boru hattı bunu yakalamalı. Data contract fikri, üretici ve tüketici takımlar arasında şemayı bir sözleşmeye bağlar.",
        "**Lineage:** Bu tablo hangi kaynaktan, hangi dönüşümlerden geçerek geldi? Bir hata bulunduğunda etkisini geriye ve ileriye doğru izleyebilmek için şart. OpenLineage bu konuda açık bir standart.",
        "**Freshness:** Veri en son ne zaman güncellendi? Dün gece çalışması gereken iş çalışmadıysa, sabahki rapor dünün değil önceki günün verisini gösterir ve kimse fark etmeyebilir.",
      ],
    },
    {
      type: "p",
      text: "Küçük bir örnek: aşağıdaki Python kodu, bir sipariş tablosunu modele ya da warehouse'a göndermeden önce basit kontrollerden geçiriyor. Gerçek projede bunları bir framework ile yazarsın ama mantık aynı.",
    },
    {
      type: "code",
      lang: "python",
      code: `import pandas as pd

def validate_orders(df: pd.DataFrame) -> list[str]:
    errors = []
    required = {"order_id", "customer_id", "amount", "created_at"}
    missing = required - set(df.columns)
    if missing:
        return [f"Eksik kolonlar: {sorted(missing)}"]

    if df["order_id"].duplicated().any():
        errors.append("Tekrarlayan order_id var")
    if df["amount"].lt(0).any():
        errors.append("Negatif tutar var")
    if df["customer_id"].isna().mean() > 0.01:
        errors.append("customer_id boşluk oranı %1'i aşıyor")

    created = pd.to_datetime(df["created_at"], errors="coerce", utc=True)
    if created.isna().any():
        errors.append("Parse edilemeyen tarih var")
    elif created.max() < pd.Timestamp.now(tz="UTC") - pd.Timedelta(hours=24):
        errors.append("Veri 24 saatten eski (freshness)")
    return errors`,
    },
    {
      type: "p",
      text: "Dönüşüm tarafında ise SQL hâlâ kral. Window function'lar, her müşterinin son siparişini bulmak ya da kümülatif toplam almak gibi işleri tek sorguda çözer. MSSQL'de şöyle bir şey:",
    },
    {
      type: "code",
      lang: "sql",
      code: `WITH ranked AS (
    SELECT
        customer_id,
        order_id,
        amount,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn,
        SUM(amount)  OVER (PARTITION BY customer_id ORDER BY created_at
                           ROWS UNBOUNDED PRECEDING) AS running_total
    FROM dbo.orders
)
SELECT customer_id, order_id AS last_order_id, amount AS last_amount, running_total
FROM ranked
WHERE rn = 1;`,
    },
    { type: "h", text: "Feature store: modelin kileri" },
    {
      type: "p",
      text: "Klasik ML'de \"son 30 günde harcanan tutar\" gibi özellikler (feature) hem eğitimde hem de canlı tahminde **aynı şekilde** hesaplanmalı. Aksi halde training-serving skew denen sinsi bir hata oluşur: model eğitimde başka, üretimde başka veri görür. Feature store'lar (Feast, Databricks Feature Store gibi) bu özellikleri merkezi olarak tanımlar, geçmişe dönük doğru değerleri (point-in-time correctness) eğitim için, düşük gecikmeli değerleri de canlı servis için sunar.",
    },
    { type: "h", text: "LLM çağında veri mühendisliği" },
    {
      type: "p",
      text: "LLM'ler veri mühendisliğini gereksiz kılmadı, tam tersine yeni bir iş yükü getirdi. En somut örnek RAG (Retrieval-Augmented Generation): model, cevap vermeden önce senin belgelerinden ilgili parçaları bulur ve bağlama ekler. Kulağa basit geliyor ama aslında tamamen bir veri boru hattı:",
    },
    {
      type: "list",
      items: [
        "**Ingestion ve temizlik:** PDF, HTML, wiki sayfaları metne çevrilir; tekrarlar, menüler ve boilerplate atılır.",
        "**Chunking:** Metin parçalara bölünür. Çok küçük parça bağlamı kaybeder, çok büyük parça alakasız bilgi taşır. Başlıklara göre bölmek ve parçalar arasında biraz örtüşme bırakmak sık kullanılan bir başlangıç.",
        "**Embedding:** Her parça bir embedding modeliyle vektöre çevrilir. Model değişirse tüm vektörleri yeniden üretmek gerekir; bu da bir backfill işidir.",
        "**Vector store:** Vektörler pgvector, Qdrant, Weaviate gibi bir depoda metadata (kaynak, tarih, yetki) ile birlikte tutulur. Çoğu zaman anahtar kelime aramasıyla birleştirilen hibrit arama daha iyi sonuç verir.",
        "**Evaluation:** Doğru parçalar geri geliyor mu (retrieval), cevap o parçalara dayanıyor mu (groundedness)? Elle hazırlanmış soru-cevap setleriyle ölçmeden \"çalışıyor gibi\" demek yetmez.",
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/rag.svg",
      alt: "Belgelerin parçalanıp embedding'e dönüştürülerek vektör deposuna yazıldığı ve sorgu anında LLM'e bağlam olarak verildiği RAG boru hattı şeması",
      caption: "RAG'in yarısı indeksleme, yarısı sorgu: ikisi de veri mühendisliği.",
    },
    {
      type: "p",
      text: "Fine-tuning için de durum aynı. Birkaç bin örneklik bir set bile dikkatli hazırlanmalı: tekrarlar ayıklanmalı, kişisel veriler maskelenmeli, test seti eğitim setine sızmamalı, her örneğin nereden geldiği kayıt altında olmalı. Modelin kalitesi büyük ölçüde bu setin kalitesine bağlı.",
    },
    { type: "h", text: "Yapay zeka veri mühendisine nasıl yardım ediyor?" },
    {
      type: "p",
      text: "Ben günlük işlerimde AI asistanlarını epey kullanıyorum ve gerçekten hız kazandırıyorlar: doğal dilden SQL taslağı yazmak, karmaşık bir sorguyu açıklamak, tablo ve kolon dokümantasyonu üretmek, regex ya da tarih formatı dönüşümü gibi sıkıcı işler. Metrik zaman serilerinde anomali tespiti (aniden düşen satır sayısı gibi) için de ML tabanlı izleme araçları yaygınlaştı.",
    },
    {
      type: "note",
      text: "Sınırları da net: model şemanı, iş kurallarını ve verinin gerçek dağılımını bilmez. Üretilen SQL sözdizimsel olarak doğru ama mantıksal olarak yanlış olabilir (yanlış JOIN, tekrar sayılan satırlar, NULL davranışı). Her sorguyu küçük bir örnekle doğrula, sonuç sayılarını kontrol et ve hassas veriyi dış servislere göndermeden önce iki kez düşün.",
    },
    { type: "h", text: "Bir öğrenci olarak yol haritam" },
    {
      type: "p",
      text: "Kendime çizdiğim sıralama aşağıda. Her adım bir öncekinin üstüne kuruluyor, o yüzden atlamamaya çalışıyorum. Süreler kişiden kişiye değişir; önemli olan her aşamada küçük ama gerçek bir proje bitirmek.",
    },
    {
      type: "table",
      head: ["Aşama", "Ne öğrenilir", "Mini proje fikri"],
      rows: [
        ["1. SQL", "JOIN, GROUP BY, window function, CTE, indeks mantığı", "Açık bir veri setinde analiz sorguları"],
        ["2. Python", "pandas, dosya/API okuma, test, temiz kod", "Bir API'den veri çekip CSV/Parquet'e yazan script"],
        ["3. Veri modelleme", "Normalizasyon, star schema, fact/dimension, dbt", "Ham tablolardan küçük bir star schema"],
        ["4. Orkestrasyon", "Airflow veya Dagster ile DAG, retry, zamanlama", "Günlük çalışan ve test eden bir pipeline"],
        ["5. Bulut warehouse", "BigQuery/Snowflake, maliyet, partition, IAM", "Pipeline'ı buluta taşıyıp dashboard bağlamak"],
        ["6. Streaming", "Kafka, event'ler, exactly-once kavramı", "Olay akışından anlık metrik üretmek"],
      ],
    },
    { type: "h", text: "Son söz" },
    {
      type: "p",
      text: "Yapay zeka sistemlerinin görünen yüzü model, ama ayakta durmasını sağlayan şey veri. İyi bir boru hattı sessizdir: veri zamanında gelir, testler geçer, kimse bir şey fark etmez. Ben de bu sessiz ama kritik tarafta uzmanlaşmak istiyorum. Sen de bu yola başlıyorsan, en iyi ilk adım hâlâ aynı: bugün biraz daha iyi SQL yaz.",
    },
  ],
};
