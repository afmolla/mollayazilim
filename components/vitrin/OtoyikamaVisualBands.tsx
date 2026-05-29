"use client";

import Image from "next/image";
import Link from "next/link";
import { OTOYIKAMA_GALLERY, OTOYIKAMA_IMAGES } from "@/lib/otoyikama-images";
import { publicHref } from "@/lib/base-path";

type Props = {
  pathname: string;
};

/** Tam genişlik görsel bantları + kayan şerit (CSS only, hızlı) */
export function OtoyikamaVisualBands({ pathname }: Props) {
  const randevu = publicHref("/randevu", pathname);
  const galeri = publicHref("/galeri", pathname);

  return (
    <>
      {/* Parallax-style tam genişlik hero band */}
      <section className="relative h-[min(52vh,420px)] w-full overflow-hidden bg-[#040608]">
        <Image
          src={OTOYIKAMA_IMAGES.wide1}
          alt="Crystal Auto Spa — premium detailing"
          fill
          className="object-cover object-center opacity-90"
          sizes="100vw"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#040608]/90 via-[#040608]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040608] via-transparent to-[#040608]/30" />
        <div className="relative z-10 flex h-full max-w-7xl flex-col justify-center px-5 md:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">Showroom parlaklığı</p>
          <h2 className="mt-2 max-w-lg text-2xl font-extrabold text-white md:text-4xl">
            Her araç ayrı prosedür — tünel yıkama değil
          </h2>
          <Link
            href={randevu}
            className="mt-6 inline-flex w-fit rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            Randevu al
          </Link>
        </div>
        <div className="otoyikama-shimmer pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      </section>

      {/* İkili tam genişlik — mobilde stack */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="group relative min-h-[280px] overflow-hidden md:min-h-[360px]">
          <Image
            src={OTOYIKAMA_IMAGES.ceramic}
            alt="Seramik kaplama uygulaması"
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">9H koruma</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl">Seramik kaplama paketi</p>
          </div>
        </div>
        <div className="group relative min-h-[280px] overflow-hidden md:min-h-[360px]">
          <Image
            src={OTOYIKAMA_IMAGES.interior}
            alt="İç mekan detailing"
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/90">İç mekan</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl">Buhar + deri bakım</p>
          </div>
        </div>
      </section>

      {/* Kayan görsel şerit */}
      <section className="overflow-hidden border-y border-cyan-500/10 bg-[#060a10] py-6">
        <div className="otoyikama-marquee flex w-max gap-4 px-4">
          {[...OTOYIKAMA_GALLERY, ...OTOYIKAMA_GALLERY].map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="relative h-36 w-56 shrink-0 overflow-hidden rounded-xl border border-white/10 md:h-44 md:w-72"
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="288px" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center">
          <Link href={galeri} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
            Tüm galeriyi gör →
          </Link>
        </p>
      </section>
    </>
  );
}
