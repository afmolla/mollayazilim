/** Yerel vitrin görselleri — hızlı, IP/CDN bağımlılığı yok */
export const OTOYIKAMA_IMAGES = {
  hero: "/vitrin/otoyikama/hero.jpg",
  wash: "/vitrin/otoyikama/wash-1.jpg",
  polish: "/vitrin/otoyikama/polish-1.jpg",
  interior: "/vitrin/otoyikama/interior-1.jpg",
  luxury: "/vitrin/otoyikama/luxury-1.jpg",
  ceramic: "/vitrin/otoyikama/ceramic-1.jpg",
  foam: "/vitrin/otoyikama/foam-1.jpg",
  detail: "/vitrin/otoyikama/detail-1.jpg",
  shine: "/vitrin/otoyikama/shine-1.jpg",
  garage: "/vitrin/otoyikama/garage-1.jpg",
  side1: "/vitrin/otoyikama/side-1.jpg",
  side2: "/vitrin/otoyikama/side-2.jpg",
  side3: "/vitrin/otoyikama/side-3.jpg",
  wide1: "/vitrin/otoyikama/wide-1.jpg",
  wide2: "/vitrin/otoyikama/wide-2.jpg",
} as const;

export const OTOYIKAMA_GALLERY = [
  { src: OTOYIKAMA_IMAGES.hero, alt: "Premium oto yıkama — showroom parlaklığı" },
  { src: OTOYIKAMA_IMAGES.wash, alt: "El yıkama — pH nötr köpük uygulaması" },
  { src: OTOYIKAMA_IMAGES.polish, alt: "Pasta cila — derin parlatma" },
  { src: OTOYIKAMA_IMAGES.ceramic, alt: "Seramik kaplama — 9H koruma katmanı" },
  { src: OTOYIKAMA_IMAGES.luxury, alt: "Lüks araç detailing sonrası" },
  { src: OTOYIKAMA_IMAGES.interior, alt: "İç mekan buharlı temizlik" },
  { src: OTOYIKAMA_IMAGES.shine, alt: "Hidrofobik yüzey — su damlası efekti" },
  { src: OTOYIKAMA_IMAGES.detail, alt: "Detaylı kaput parlatma" },
  { src: OTOYIKAMA_IMAGES.foam, alt: "Köpüklü dış yıkama istasyonu" },
  { src: OTOYIKAMA_IMAGES.garage, alt: "Profesyonel detailing garajı" },
  { src: OTOYIKAMA_IMAGES.wide1, alt: "Crystal Auto Spa genel görünüm" },
  { src: OTOYIKAMA_IMAGES.wide2, alt: "Seramik sonrası derin parlaklık" },
] as const;

export const OTOYIKAMA_HERO_SIDES = [
  { src: OTOYIKAMA_IMAGES.luxury, alt: "Parlak siyah araç — pasta cila sonrası", className: "col-span-2 row-span-2 min-h-[220px]" },
  { src: OTOYIKAMA_IMAGES.polish, alt: "Profesyonel detailing — kaput parlatma", className: "min-h-[120px]" },
  { src: OTOYIKAMA_IMAGES.ceramic, alt: "Seramik kaplama — mikrofiber son kat", className: "min-h-[120px]" },
] as const;
