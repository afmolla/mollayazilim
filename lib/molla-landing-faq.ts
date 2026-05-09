/** Ana vitrin SSS — hem sayfa hem FAQ JSON-LD için tek kaynak */
export type MollaFaqItem = { q: string; a: string };

export const MOLLA_LANDING_FAQ: MollaFaqItem[] = [
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
