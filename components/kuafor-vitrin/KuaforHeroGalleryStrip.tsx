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
    src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=85",
    alt: "Kuaför salonu — kesim ve şekillendirme istasyonu",
  },
  {
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&q=85",
    alt: "Profesyonel saç şekillendirme",
  },
  {
    src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=900&q=85",
    alt: "Renk ve bakım — salon detayı",
  },
  {
    src: "https://images.unsplash.com/photo-1633681926027-932eaa8e5e2e?w=900&q=85",
    alt: "Saç bakımı ve ürün kullanımı",
  },
  {
    src: "https://images.unsplash.com/photo-1522338140262-f46f5912568e?w=900&q=85",
    alt: "Makyaj ve özel gün hazırlığı",
  },
  {
    src: "https://images.unsplash.com/photo-1487412919487-39188986ded7?w=900&q=85",
    alt: "Şehir merkezinde modern güzellik stüdyosu",
  },
];

export function KuaforHeroGalleryStrip(props: { variant: "erkek" | "kadin"; demoLabel?: boolean }) {
  const imgs = props.variant === "erkek" ? ERKEK_GALLERY : KADIN_GALLERY;
  const label = props.demoLabel !== false;
  return (
    <div className="relative w-full border-y border-[var(--border)] bg-black/25 py-4 md:py-7">
      {label ? (
        <p className="mb-3 px-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)] md:mb-4 md:px-6">
          {props.variant === "erkek" ? "Salondan kareler · demo vitrin" : "Atölyeden seçkiler · demo vitrin"}
        </p>
      ) : null}
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 pt-0 md:mx-auto md:grid md:max-w-7xl md:grid-cols-3 md:gap-4 lg:grid-cols-6 md:overflow-visible md:px-6">
        {imgs.map((g) => (
          <div
            key={g.src}
            className="relative aspect-[3/4] w-[46vw] max-w-[19rem] shrink-0 overflow-hidden rounded-2xl md:aspect-[4/5] md:w-auto md:max-w-none md:min-h-[220px] lg:min-h-[260px]"
          >
            <Image src={g.src} alt={g.alt} fill className="object-cover" sizes="(max-width:768px) 46vw, 18vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
