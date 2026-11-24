import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "progressive-overload",
  title: "Progressive Overload: Kas Gelişiminin Asıl Motoru",
  date: "2026-10-12",
  tags: ["fitness", "kas gelişimi", "antrenman", "python"],
  cover: "/blog/progressive-overload/cover.svg",
  coverAlt: "Retro CRT penceresinde 'Progressive Overload' yazısı, yükselen piksel sütunlar ve piksel bir halter",
  summary:
    "Aşamalı yüklenme nedir, kası neden büyütür ve haftadan haftaya nasıl uygulanır? Çift aşamalı ilerleme, RIR, deload, kayıt tutma ve küçük bir Python betiğiyle tahmini 1RM hesabı.",
  blocks: [
    {
      type: "p",
      text: "Salona düzenli gidip aylarca aynı ağırlıkları aynı tekrarlarla kaldırmak, kas kazanımında en sık düşülen tuzaklardan biri. Vücut zekidir: Bir yüke uyum sağladıktan sonra ona daha fazla adaptasyonla cevap vermesi için bir sebep kalmaz. İşte **progressive overload**, yani **aşamalı yüklenme**, tam olarak bu sebebi sağlamakla ilgili. Bu yazıda kas kazanımına odaklanırken kendi antrenmanımda kullandığım mantığı, bilimsel arka planıyla birlikte toparlamaya çalıştım.",
    },
    {
      type: "note",
      text: "Bu yazı genel bilgilendirme amaçlıdır, tıbbi veya kişiye özel antrenman tavsiyesi değildir. Sağlık sorunun, sakatlığın veya özel bir durumun varsa bir hekime ya da uzman bir antrenöre danış.",
    },
    { type: "h", text: "Aşamalı yüklenme nedir?" },
    {
      type: "p",
      text: "En basit tanımıyla: Kaslara zaman içinde **giderek artan bir zorluk** sunmak. Hipertrofi (kas büyümesi), kasın yeterince zorlayıcı mekanik gerilime maruz kalmasıyla tetiklenir. Antrenman sinyali verir, toparlanma döneminde kas protein sentezi artar ve kas lifleri bir sonraki sefere daha hazırlıklı olacak şekilde uyum sağlar. Uyum gerçekleştikçe aynı yük göreli olarak kolaylaşır; sinyali canlı tutmak için de toplam zorluğu yavaş yavaş artırmak gerekir.",
    },
    {
      type: "p",
      text: "Önemli nokta şu: Aşamalı yüklenme \"her antrenmanda daha ağır kaldır\" demek değil. Zorluğu artırmanın birden fazla yolu var ve yeni başlayanlar haftalarca hızlı ilerlerken deneyimliler aylara yayılan küçük adımlarla ilerler.",
    },
    { type: "h", text: "Yüklenmenin yedi kolu" },
    {
      type: "img",
      src: "/blog/progressive-overload/yuklenme-kollari.svg",
      alt: "Merkezde 'Aşamalı Yüklenme' kutusu, çevresinde yük, tekrar, set/hacim, tempo, frekans, hareket açıklığı ve dinlenme kutuları",
      caption: "Zorluğu artırmanın tek yolu ağırlık eklemek değil.",
    },
    {
      type: "list",
      items: [
        "**Yük:** Aynı tekrar sayısında daha fazla ağırlık. En ölçülebilir yöntem; büyük hareketlerde 2,5 kg, küçük hareketlerde 1–2 kg'lık adımlar yeterli.",
        "**Tekrar:** Aynı ağırlıkla bir iki tekrar daha fazla yapmak. Çift aşamalı ilerlemenin ilk adımı budur.",
        "**Set / hacim:** Kas grubu başına haftalık set sayısını artırmak. Araştırmalar hipertrofi için haftada kas başına kabaca 10–20 zorlayıcı seti iyi bir aralık olarak gösteriyor; ama hacmi sonsuza kadar artırmak toparlanmayı bozar.",
        "**Tempo / gerim altında kalma süresi:** Eksantrik (indirme) fazını kontrollü yapmak hareketi zorlaştırır. Yalnız bunu ağırlığı düşürmek için bahane yapmamak lazım.",
        "**Frekans:** Bir kas grubunu haftada bir yerine iki kez çalıştırmak, aynı hacmi daha kaliteli setlere bölmeyi sağlar.",
        "**Hareket açıklığı (ROM):** Yarım squat'tan tam derinliğe geçmek de bir yüklenme artışıdır. Özellikle kasın uzamış pozisyonunda çalışmanın hipertrofiye katkısına dair kanıtlar giderek artıyor.",
        "**Dinlenme:** Aynı işi daha kısa aralarla yapmak yoğunluğu artırır. Ancak hipertrofi için setler arası çok kısa dinlenmek performansı düşürebilir; büyük hareketlerde 2–3 dakika genelde daha mantıklı.",
      ],
    },
    { type: "h", text: "Çift aşamalı ilerleme (double progression)" },
    {
      type: "p",
      text: "Benim en çok kullandığım yöntem bu, çünkü hem basit hem de kendi kendini düzenliyor. Bir **tekrar aralığı** seçiyorsun, örneğin 3 set × 8–12. Önce aynı ağırlıkla tekrarları artırıyorsun; tüm setlerde aralığın üst sınırına ulaştığında ağırlığı küçük bir adım artırıp aralığın altına geri dönüyorsun.",
    },
    {
      type: "img",
      src: "/blog/progressive-overload/cift-asamali-ilerleme.svg",
      alt: "Beş basamaklı merdiven: 1-4. haftalarda 40 kg ile tekrarlar 8/8/8'den 12/12/12'ye çıkıyor, 5. haftada 42,5 kg ile 8/8/8'e dönülüyor",
      caption: "Önce tekrar, sonra ağırlık: 40 kg × 12/12/12 olunca 42,5 kg × 8'e dönülür.",
    },
    { type: "h", text: "RPE ve RIR: Ne kadar zorlanmalı?" },
    {
      type: "p",
      text: "Aşamalı yüklenmenin işe yaraması için setlerin **yeterince zor** olması gerekiyor. Bunu ölçmenin pratik yolu **RIR** (Reps in Reserve, yedekte kalan tekrar) ya da onun tersi olan **RPE** (algılanan zorluk, 1–10). RPE 8 kabaca \"2 tekrar daha yapabilirdim\" yani RIR 2 demek. Hipertrofi odaklı çalışmalarda setlerin çoğunu tükenişe 0–3 tekrar kala bitirmek iyi bir hedef. Her seti tam tükenişe götürmek ekstra fayda sağlamadan yorgunluğu artırabilir; bunu daha çok izolasyon hareketlerinin son setine saklıyorum.",
    },
    { type: "h", text: "Deload ve plato" },
    {
      type: "p",
      text: "Sürekli yüklenme birikmiş yorgunluk da demek. **Deload**, hacmi ve/veya yoğunluğu bilinçli olarak bir haftalığına düşürmek demek: Genelde aynı hareketler, set sayısı yaklaşık yarıya ve RIR yükseltilerek. Çoğu kişi için 4–8 haftada bir ya da yorgunluk belirtileri biriktiğinde mantıklı. Aşağıdaki örnek veride 6. hafta deload haftası; sonrasında hacim kaldığı yerden devam ediyor.",
    },
    {
      type: "img",
      src: "/blog/progressive-overload/hacim-grafigi.svg",
      alt: "Dokuz haftalık squat hacmi çizgi grafiği: 4800 kg'dan 6000 kg'a artış, 6. haftada 3600 kg'a deload düşüşü, ardından 6700 kg'a yükseliş",
      caption: "Örnek veri: Beş hafta düzenli artış, 6. haftada deload (~%40 daha az hacim), sonra yeni zirve.",
    },
    {
      type: "p",
      text: "Plato belirtileri genelde şunlar: Üç dört antrenman üst üste aynı hareketin tekrarlarında artış olmaması ya da düşüş, ısınma setlerinin her zamankinden ağır gelmesi, uykunun bozulması, eklemlerde sızlama ve antrenmana karşı isteksizlik. Böyle bir durumda önce uyku, beslenme ve deload'a bakmak, sonra programı (tekrar aralığı, hareket seçimi, hacim) değiştirmeyi düşünmek gerekiyor.",
    },
    { type: "h", text: "Takip etmeden ilerleme olmaz" },
    {
      type: "p",
      text: "Aşamalı yüklenme bir veri problemi aslında: Geçen hafta ne yaptığını bilmiyorsan bu hafta neyi aşacağını da bilemezsin. Ben basit bir tablo tutuyorum:",
    },
    {
      type: "table",
      head: ["Tarih", "Hareket", "Ağırlık", "Tekrarlar", "Son set RIR"],
      rows: [
        ["07.09", "Squat", "80 kg", "8 / 8 / 7", "1"],
        ["14.09", "Squat", "80 kg", "8 / 8 / 8", "2"],
        ["21.09", "Squat", "82,5 kg", "8 / 7 / 7", "1"],
      ],
    },
    {
      type: "p",
      text: "Veri mühendisliğine meraklı biri olarak bunu bir de koda dökmeden duramadım. Aşağıdaki betik her antrenman için toplam hacmi (ağırlık × toplam tekrar) ve **Epley formülüyle** tahmini 1RM'i (tek tekrar maksimumu) hesaplıyor: `1RM ≈ ağırlık × (1 + tekrar / 30)`. Epley yüksek tekrarlarda güvenilirliğini kaybeder, ama aynı formülü sürekli kullanınca trendi takip etmek için gayet iş görür.",
    },
    {
      type: "code",
      lang: "python",
      code: `log = [
    ("07.09", "Squat", 80.0, [8, 8, 7]),
    ("14.09", "Squat", 80.0, [8, 8, 8]),
    ("21.09", "Squat", 82.5, [8, 7, 7]),
]

def epley(kg, reps):
    return kg * (1 + reps / 30)

for tarih, hareket, kg, setler in log:
    hacim = kg * sum(setler)
    e1rm = epley(kg, max(setler))
    print(f"{tarih} {hareket}: hacim={hacim:.0f} kg, tahmini 1RM={e1rm:.1f} kg")

# 07.09 Squat: hacim=1840 kg, tahmini 1RM=101.3 kg
# 14.09 Squat: hacim=1920 kg, tahmini 1RM=101.3 kg
# 21.09 Squat: hacim=1815 kg, tahmini 1RM=104.5 kg`,
    },
    {
      type: "p",
      text: "Dikkat: Üçüncü antrenmanda hacim hafifçe düştü ama tahmini 1RM arttı. Tek bir metriğe bakmak yanıltıcı olabilir; ikisini birlikte izlemek daha sağlıklı bir resim veriyor.",
    },
    { type: "h", text: "Beslenme, uyku ve toparlanma" },
    {
      type: "p",
      text: "Antrenman sinyali veriyor ama büyümeyi toparlanma sağlıyor. Kanıtların işaret ettiği temel noktalar:",
    },
    {
      type: "list",
      items: [
        "**Protein:** Günde vücut ağırlığının kilogramı başına yaklaşık **1,6–2,2 g** protein, kas kazanımı için yaygın kabul gören aralık. Bunu gün içine 3–5 öğüne yaymak pratikte işimi kolaylaştırıyor.",
        "**Kalori:** Kas kazanımı için **hafif bir kalori fazlası** (bakım kalorisinin kabaca %5–10 üstü) yeterli. Fazlası çoğunlukla yağ olarak geri döner.",
        "**Uyku:** Gecelik 7–9 saat. Kısa uyku hem performansı hem toparlanmayı doğrudan düşürüyor.",
        "**Yeterli karbonhidrat:** Yüksek hacimli antrenmanların yakıtı; özellikle antrenman öncesi ve sonrası öğünlerde.",
      ],
    },
    { type: "h", text: "Sık yapılan hatalar" },
    {
      type: "list",
      ordered: true,
      items: [
        "**Formu ağırlığa feda etmek:** Hareket açıklığı kısalıyorsa ya da gövde savruluyorsa, aslında ilerleme değil hile var.",
        "**Çok hızlı artırmak:** Her hafta 5 kg eklemeye çalışmak kısa sürede duvara çarptırır. Küçük adımlar uzun vadede kazandırır.",
        "**Programı sürekli değiştirmek:** Hareketler her hafta değişirse neyin ilerlediğini ölçemezsin. Temel hareketleri en az 6–8 hafta sabit tut.",
        "**Kayıt tutmamak:** Hafızaya güvenmek, bir önceki antrenmanı tekrarlamakla sonuçlanır.",
        "**Deload'u ve uykuyu atlamak:** Yorgunluk biriktikçe performans düşer; bu da \"plato\" sanılır.",
        "**Sadece ağırlığa bakmak:** Tekrar, set ve hareket kalitesindeki artış da ilerlemedir.",
      ],
    },
    {
      type: "quote",
      text: "Her antrenmanda biraz daha iyi olmaya çalış, ama bu \"biraz\"ın gerçekten küçük olmasına izin ver.",
    },
    {
      type: "p",
      text: "Kısacası aşamalı yüklenme sihirli bir program değil; ölç, biraz zorla, toparlan, tekrarla döngüsü. Kodda olduğu gibi antrenmanda da küçük ve düzenli commit'ler, tek seferlik büyük değişikliklerden daha sağlam sonuç veriyor.",
    },
  ],
};
