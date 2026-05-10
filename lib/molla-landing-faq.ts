/** Ana vitrin SSS — hem sayfa hem FAQ JSON-LD için tek kaynak */
export type MollaFaqItem = { q: string; a: string };

export const MOLLA_LANDING_FAQ: MollaFaqItem[] = [
  {
    q: "İstanbul’da web sitesi ve panel için süre ne kadar?",
    a: "Keşif görüşmesinden sonra çoğu projede 24 saat içinde demo çıkarıyoruz; içerik hazırsa yayına çıkış genelde 3–10 gün aralığında planlanır. Kapsam büyüdükçe takvim birlikte netleştirilir.",
  },
  {
    q: "SEO uyumlu site teslim ediyor musunuz?",
    a: "Evet. Teknik temel (meta, canonical, site haritası, yapılandırılmış veri, mobil uyum ve performans) teslim kapsamındadır. Rekabetçi anahtar kelimelerde üst sıralar ise içerik, otorite ve sürekli iyileştirme gerektirir; bunun için ayrıca içerik ve ölçüm önerileri sunuyoruz.",
  },
  {
    q: "Web sitesi yaptığınızı 3 saniyede nasıl anlatıyorsunuz?",
    a: "İlk ekran başlığı sektör + vaadi net söyler. CTA tek tıklık (WhatsApp / form / randevu). Hemen altında demo/kanıt ve süreç yer alır.",
  },
  {
    q: "Teslim süresi ne kadar?",
    a: "İhtiyaca göre değişir. Genelde 24 saat içinde demo, 3–10 gün içinde yayına çıkış planlarıyla ilerliyoruz.",
  },
  {
    q: "Panel ile neleri yönetebilirim?",
    a: "Menüler, sayfalar, medya, SEO ayarları, içerikler ve gelen lead’ler tek panelden yönetilebilir.",
  },
];
