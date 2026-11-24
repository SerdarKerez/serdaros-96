import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "raw-dna-mapping",
  title: "Ham DNA Verisini Sınıflandırmak ve Haritalandırmak",
  date: "2026-11-20",
  tags: ["genomik", "veri mühendisliği", "python", "pandas", "biyoinformatik"],
  cover: "/blog/raw-dna-mapping/cover.svg",
  coverAlt: "Retro CRT ekranında kromozom çubukları ve SNP işaretleri, üstünde 'Ham DNA Haritası' başlığı",
  summary:
    "Tüketici DNA testlerinden inen ham dosyayı okuyup temizlemek, SNP'leri kromozom ve genlere yerleştirmek, kategorilere ayırmak ve görselleştirmek üzerine bir veri mühendisliği yolculuğu.",
  blocks: [
    {
      type: "p",
      text: "Genomik CRM konsept projem üzerinde çalışırken kendime hep aynı soruyu sordum: bir kullanıcı 23andMe ya da AncestryDNA'dan indirdiği ham dosyayı yüklediğinde, o metin yığınını anlamlı bir haritaya nasıl çeviririm? Bu yazıda öğrendiklerimi adım adım topladım: dosya formatı, referans genomlar, kalite kontrol, anotasyon, sınıflandırma ve en sonunda görselleştirme. Bir de işin hassas tarafı olan gizlilik ve etik.",
    },
    {
      type: "note",
      text: "**Önemli:** Bu yazı eğitim amaçlıdır. Tüketici genotipleme çiplerinin sonuçları tanı koymaz. Sağlıkla ilgili her bulgu klinik bir laboratuvarda doğrulanmalı ve bir hekim ya da genetik danışmanla değerlendirilmelidir.",
    },
    { type: "h", text: "Ham DNA dosyası aslında ne?" },
    {
      type: "p",
      text: "İlk yanılgım şuydu: bu dosyaların tüm genomu içerdiğini sanıyordum. Öyle değil. Tüketici testleri **genotipleme çipi** (SNP array) kullanır. Yaklaşık 3 milyar baz çiftinin tamamını okumak yerine, önceden seçilmiş **600-700 bin civarında SNP** (tek nükleotid polimorfizmi) noktasına bakar. Yani genomun binde birinden bile küçük bir kısmı. Tüm genom dizileme (WGS) ise her pozisyonu okur, çok daha büyük veri üretir ve çip tarafından hiç kapsanmayan nadir varyantları da yakalayabilir.",
    },
    {
      type: "p",
      text: "Dosya genelde sekmeyle ayrılmış (TSV) düz bir metindir. Başta `#` ile başlayan yorum satırları, ardından dört sütun gelir: `rsid`, `chromosome`, `position` ve `genotype`. Aşağıdaki satırlar tamamen uydurmadır, sadece formatı göstermek için:",
    },
    {
      type: "code",
      lang: "text",
      code: `# rsid\tchromosome\tposition\tgenotype
# Bu satirlar ornek amaclidir, gercek bir kisiye ait degildir
rs9990001\t1\t752566\tAG
rs9990002\t1\t776546\tAA
rs9990003\t2\t1102344\t--
rs9990004\t7\t5530601\tCT
rs9990005\tX\t2700157\tG
rs9990006\tMT\t3594\tC`,
    },
    {
      type: "p",
      text: "AncestryDNA formatında genotip iki ayrı sütuna (`allele1`, `allele2`) bölünür ve kromozomlar bazen sayıyla kodlanır (örneğin X için 23). Yani ilk iş, farklı sağlayıcıları tek bir şemaya oturtan bir normalizasyon katmanı.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/pipeline.svg", alt: "Ham dosyadan kalite kontrole, anotasyona, sınıflandırmaya ve haritaya uzanan beş adımlı veri hattı şeması", caption: "Kurguladığım veri hattı: ham dosya, QC, anotasyon, sınıflandırma, harita." },
    { type: "h", text: "Referans genom: GRCh37 mi, GRCh38 mi?" },
    {
      type: "p",
      text: "`position` sütunu tek başına anlamsızdır; hangi **referans genom sürümüne** göre yazıldığını bilmeniz gerekir. Tüketici dosyalarının çoğu hâlâ **GRCh37 (hg19)** kullanır, güncel veritabanlarının büyük kısmı ise **GRCh38 (hg38)** ile çalışır. İki sürüm arasında boşluklar kapatılmış, bazı bölgeler düzeltilmiş ve yeniden dizilmiş; bu yüzden aynı SNP'nin koordinatı farklı çıkabilir. Koordinatları bir sürümden diğerine taşımaya **liftover** denir (UCSC liftOver, CrossMap gibi araçlar zincir dosyalarıyla yapar). Bazı noktalar taşınamaz ya da başka kromozoma düşer; bunları ayrıca işaretlemek gerekir. Pratik ipucu: mümkünse birleştirmeyi koordinat yerine `rsid` üzerinden yapın, ama rsID'lerin de zamanla birleştirildiğini (merge) unutmayın.",
    },
    { type: "h", text: "Okuma ve kalite kontrol (QC)" },
    {
      type: "list",
      items: [
        "**No-call'lar:** `--` çipin o noktayı güvenle okuyamadığı anlamına gelir. Bunları ayıklıyor ve sayısını tutuyorum.",
        "**Call rate:** okunan SNP / toplam SNP oranı. İyi bir örnekte genelde %98'in üzerindedir; çok düşükse numune ya da dosya şüphelidir.",
        "**Strand (iplik) sorunları:** Bazı kaynaklar alelleri ters iplikten raporlar. A/T ve C/G gibi kendi tamamlayıcısı olan SNP'lerde hangi iplik olduğu dosyaya bakarak anlaşılamaz; bunlar karşılaştırmada dikkat ister.",
        "**Cinsiyet kromozomları ve MT:** Erkeklerde X ve Y tek kopya olduğu için genotip tek harf görünür. Mitokondri (MT) de haploiddir. Heterozigot görünen bir X çağrısı erkek örnekte hata işaretidir.",
        "**Tekrarlar ve geçersiz değerler:** Aynı rsID'nin iki kez gelmesi, `I`/`D` gibi indel kodları ya da beklenmeyen karakterler ayrıca loglanmalı.",
      ],
    },
    { type: "h", text: "Haritalandırma ve anotasyon" },
    {
      type: "p",
      text: "Temiz veriyle SNP'leri kromozom üzerindeki konumlarına ve oradan genlere yerleştiriyorum. Bir SNP bir genin içinde (ekzon, intron), düzenleyici bir bölgede ya da genler arası bölgede olabilir. Sonra herkese açık veritabanlarıyla zenginleştirme geliyor:",
    },
    {
      type: "table",
      head: ["Kaynak", "Ne katar?"],
      rows: [
        ["dbSNP", "rsID kimlikleri, referans/alternatif aleller, konum"],
        ["ClinVar", "Varyant için gönderilmiş klinik yorumlar ve önem sınıfı"],
        ["gnomAD", "Popülasyonlara göre alel frekansları (nadir mi, yaygın mı?)"],
        ["GWAS Catalog", "Özellik ve hastalıklarla istatistiksel ilişkiler (nedensellik değil)"],
      ],
    },
    {
      type: "p",
      text: "Burada kavramsal olarak düşünmek önemli: GWAS ilişkileri çoğunlukla küçük etkili ve istatistikseldir; tek bir SNP'den kişisel sonuç çıkarmak yanıltıcı olur. İyi bilinen bir örnek: LCT geninin yakınındaki `rs4988235`, özellikle Avrupa kökenli popülasyonlarda yetişkinlikte laktaz kalıcılığı ile ilişkilendirilir. Ama bu bile her popülasyonda aynı şekilde çalışmaz.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/ideogram.svg", alt: "1-22, X ve Y kromozomlarının çubuk ideogramı; üzerinde SNP yoğunluğunu gösteren renkli işaretler", caption: "Kromozom ideogramı ve SNP yoğunluğu işaretleri (temsili, örnek veri)." },
    { type: "h", text: "Sınıflandırma" },
    {
      type: "p",
      text: "Anotasyondan sonra her varyanta bir ya da birden fazla etiket veriyorum:",
    },
    {
      type: "list",
      items: [
        "**Soy bilgilendirici (AIM):** popülasyonlar arasında frekansı belirgin şekilde farklılaşan SNP'ler.",
        "**Özellik (trait):** göz rengi, laktaz kalıcılığı gibi GWAS ilişkili işaretler.",
        "**Farmakogenomik:** ilaç metabolizmasıyla ilişkili genlerdeki (örneğin CYP ailesi) varyantlar; PharmGKB/CPIC kaynaklarıyla eşleşir.",
        "**Klinik önem:** ClinVar'daki ACMG tabanlı beş sınıf: Patojenik, Muhtemel patojenik, Önemi belirsiz (VUS), Muhtemel benign, Benign.",
        "**Zigotluk:** iki alel aynıysa homozigot (AA), farklıysa heterozigot (AG); tek kopyalı X/Y/MT için hemizigot.",
      ],
    },
    {
      type: "note",
      text: "Çiplerde çok nadir varyantlar için yanlış pozitif oranı oldukça yüksek olabilir. Bu yüzden projemde 'Patojenik' etiketli bir eşleşme hiçbir zaman sonuç gibi gösterilmiyor; yalnızca 'klinik doğrulama gerektirir' uyarısıyla listeleniyor.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/categories.svg", alt: "Varyant kategorilerinin yatay çubuk grafiği: soy bilgilendirici, özellik, farmakogenomik, klinik sınıflar; örnek veri etiketli", caption: "Kategori dağılımı. Sayılar tamamen uydurmadır (örnek veri)." },
    { type: "h", text: "Python ile ilk adım" },
    {
      type: "p",
      text: "pandas ile dosyayı okuyup no-call'ları atan, kromozom başına sayan ve küçük bir anotasyon tablosuyla birleştiren kısa bir örnek:",
    },
    {
      type: "code",
      lang: "python",
      code: `import pandas as pd

raw = pd.read_csv(
    "genome_raw.txt", sep="\\t", comment="#",
    names=["rsid", "chrom", "pos", "genotype"],
    dtype={"rsid": str, "chrom": str, "pos": "int64", "genotype": str},
)

total = len(raw)
calls = raw[raw["genotype"] != "--"].copy()
print(f"Call rate: {len(calls) / total:.2%}")

order = [str(i) for i in range(1, 23)] + ["X", "Y", "MT"]
calls["chrom"] = pd.Categorical(calls["chrom"], categories=order, ordered=True)
per_chrom = calls.groupby("chrom", observed=False).size()
print(per_chrom)

# Zigotluk (tek harfli cagrilar hemizigot)
g = calls["genotype"]
calls["zygosity"] = "hemizygous"
calls.loc[(g.str.len() == 2) & (g.str[0] == g.str[1]), "zygosity"] = "homozygous"
calls.loc[(g.str.len() == 2) & (g.str[0] != g.str[1]), "zygosity"] = "heterozygous"

# Ornek anotasyon tablosu: rsid, gene, category, clin_sig
annot = pd.read_csv("annotations.tsv", sep="\\t")
annotated = calls.merge(annot, on="rsid", how="left")
print(annotated["category"].value_counts(dropna=False))`,
    },
    { type: "h", text: "Görselleştirme fikirleri" },
    {
      type: "list",
      items: [
        "**İdeogram / karyogram:** her kromozom bir çubuk, SNP'ler ya da etiketli varyantlar konumlarına göre işaretler.",
        "**Manhattan tarzı grafik:** x ekseninde kromozomlar sırayla, y ekseninde bir skor (örneğin `-log10` alel frekansı). Klasik Manhattan grafiği GWAS p-değerleri içindir; tek kişide bunu 'nadirlik haritası' olarak uyarlıyorum.",
        "**Kategori çubukları ve zigotluk oranları:** kullanıcıya özet panel.",
      ],
    },
    { type: "h", text: "Veri mühendisliği açısı" },
    {
      type: "p",
      text: "Benim için asıl keyifli kısım burası. Tek bir dosya küçük (20-30 MB), ama binlerce kullanıcıya ölçeklediğinizde düzenli bir şema gerekiyor. Kurguladığım tablo: `sample_id, rsid, chrom, pos_grch37, pos_grch38, allele1, allele2, zygosity, is_nocall, source, file_version`. Veriyi **Parquet** formatında, **kromozoma göre bölümlenmiş** (partition) olarak saklıyorum; sorguların çoğu zaten kromozom filtresiyle geldiği için motor gereksiz dosyaları hiç okumuyor. Anotasyon tabloları ayrı tutulup sürümleniyor, çünkü ClinVar sınıfları zamanla değişebiliyor ve bir sonucun hangi veritabanı sürümüyle üretildiğini bilmek gerekiyor.",
    },
    { type: "h", text: "Gizlilik ve etik" },
    {
      type: "p",
      text: "Genetik veri sıradan bir kişisel veri değil. KVKK'da da GDPR'da da **özel nitelikli kişisel veri** sayılıyor; açık rıza ve sıkı güvenlik önlemleri gerektiriyor. Üstelik sadece sizi değil, akrabalarınızı da ilgilendiriyor ve değiştirilemiyor. Bu yüzden projede şu ilkelere bağlı kalıyorum:",
    },
    {
      type: "list",
      items: [
        "Mümkünse **yerel işleme**: dosya tarayıcıda ya da kullanıcının makinesinde analiz edilir, sunucuya gönderilmez.",
        "Açık, geri alınabilir **rıza** ve verinin tamamen silinebilmesi.",
        "Şifreleme, en az veri ilkesi ve kimlik bilgisinden ayrı tutulan örnek kimlikleri.",
        "Sağlık sonuçlarını teşhis gibi sunmamak; her klinik etiketin yanında doğrulama uyarısı.",
      ],
    },
    {
      type: "quote",
      text: "Çip verisi bir harita taslağıdır, arazinin kendisi değil. Klinik bir karar için doğrulanmış test ve uzman yorumu şart.",
    },
    {
      type: "p",
      text: "Sıradaki adımım, liftover işlemini otomatikleştirip anotasyon sürümlerini izleyen küçük bir ETL hattı kurmak. Bitirince onu da buraya yazacağım.",
    },
  ],
};
