"use client";

import Image from "next/image";

/** Tam genişlik görsel şeridi — kuaför vitrinlerinde zengin görünüm için */
const ERKEK_GALLERY: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=85",
    alt: "Berber salonu — kesim istasyonu",
  },
  {
    src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=85",
    alt: "Profesyonel traş ve sakal şekillendirme",
  },
  {
    src: "https://images.unsplash.com/photo-1622287162718-b8f7e8e45f5e?w=800&q=85",
    alt: "Berber aynası ve aydınlatma",
  },
  {
    src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=85",
    alt: "Berber detay — makine işçiliği",
  },
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=85",
    alt: "Fade kesim — konsantre çalışma",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=85",
    alt: "Salon oturma — modern berber",
  },
];

const KADIN_GALLERY: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85",
    alt: "Kuaför salonu — renk ve kesim",
  },
  {
    src: "https://images.unsplash.com/photo-1560869713-e52375cc9f29?w=800&q=85",
    alt: "Saç boyama ve bakım",
  },
  {
    src: "https://images.unsplash.com/photo-1490633874781-fb324728d0fa?w=800&q=85",
    alt: "Salon detay — fön ve şekillendirme",
  },
  {
    src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=85",
    alt: "Doğal ışıkta kuaför köşesi",
  },
  {
    src: "https://images.unsplash.com/photo-1522338140262-f46f5912568e?w=800&q=85",
    alt: "Makyaj ve özel gün hazırlığı",
  },
  {
    src: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=85",
    alt: "Salon ürünleri ve bakım",
  },
];

export function KuaforHeroGalleryStrip(props: { variant: "erkek" | "kadin"; demoLabel?: boolean }) {
  const imgs = props.variant === "erkek" ? ERKEK_GALLERY : KADIN_GALLERY;
  const label = props.demoLabel !== false;
  return (
    <div className="relative w-full border-y border-[var(--border)] bg-black/[0.15] py-3 md:py-4">
      {label ? (
        <p className="mb-2 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)] md:px-6">
          {props.variant === "erkek" ? "Salondan kareler · demo vitrin" : "Atölyeden seçkiler · demo vitrin"}
        </p>
      ) : null}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-0 md:mx-auto md:grid md:max-w-6xl md:grid-cols-6 md:gap-3 md:overflow-visible md:px-6">
        {imgs.map((g) => (
          <div
            key={g.src}
            className="relative aspect-[4/5] w-[42vw] max-w-[13rem] shrink-0 overflow-hidden rounded-xl md:aspect-[3/4] md:w-auto md:max-w-none"
          >
            <Image src={g.src} alt={g.alt} fill className="object-cover" sizes="(max-width:768px) 42vw, 16vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
