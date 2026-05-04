import Link from "next/link";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { GradientBg } from "@/components/molla/GradientBg";
import { MollaNavbar } from "@/components/molla/MollaNavbar";
import { MollaFooter } from "@/components/molla/MollaFooter";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
      {children}
    </span>
  );
}

function SectionTitle(props: { overline: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold tracking-wide text-white/70">{props.overline}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">{props.title}</h2>
      <p className="mt-3 text-sm text-white/70 md:text-base">{props.desc}</p>
    </div>
  );
}

const FEATURES = [
  { title: "Hızlı teslim", desc: "Hazır altyapı + özelleştirme ile günler içinde demo." },
  { title: "Mobil uyumlu", desc: "Tüm ekranlarda premium görünüm ve etkileşim." },
  { title: "Panel dahil", desc: "İçerik, medya, menüler, ayarlar — tek panelden." },
  { title: "Özel tasarım", desc: "Markanıza göre tema, sayfa yapısı ve akışlar." },
];

/** Vercel üretimde kök sayfa `next/image` optimizer ile ara sıra 500; doğrudan img kullan. */
export const dynamic = "force-dynamic";

const TESTIMONIALS = [
  {
    name: "Örnek İşletme",
    role: "Kurucu",
    quote: "Paneli özelleştirip aynı gün yayına aldık. Hız ve iletişim çok iyi.",
  },
  {
    name: "Demo Müşteri",
    role: "Yönetici",
    quote: "Mobilde çok iyi görünüyor. QR menü ve rezervasyon akışı işimizi kolaylaştırdı.",
  },
  {
    name: "Stüdyo X",
    role: "Operasyon",
    quote: "İçerik güncellemesi saniyeler içinde yansıdı. Tam aradığımız sistem.",
  },
];

export default async function MollaHome() {
  return (
    <>
      <JsonLdLocalBusiness />
      <GradientBg>
        <MollaNavbar />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:px-6 md:pb-16 md:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <Pill>Özel yazılım · Admin panelleri · Sektörel sistemler</Pill>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] md:text-5xl">
                İşletmeniz İçin{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                  Özel Yazılım Çözümleri
                </span>
              </h1>
              <p className="mt-5 max-w-prose text-base text-white/75 md:text-lg">
                Molla Yazılım; işletmeye özel web siteleri, yönetim panelleri ve sektöre özel hazır sistemleri hızlıca
                uyarlayıp yayına alır. Modern tasarım, yüksek performans ve ölçülebilir sonuçlar.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#demolar"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:opacity-95"
                >
                  Demo gör
                </a>
                <a
                  href="#iletisim"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  İletişime geç
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 text-xs text-white/70 md:grid-cols-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="mt-1 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-cyan-400/10 blur-2xl" />
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-2xl">
                <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                  Panel önizleme (demo)
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">İçerik & menü yönetimi</p>
                    <p className="mt-1 text-sm text-white/70">
                      Sayfaları ve menüleri panelden yönetin, anında yayına yansısın.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {["Randevular / Rezervasyonlar", "Medya yöneticisi", "QR menü", "Yedekleme"].map((x) => (
                        <div
                          key={x}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80"
                        >
                          {x}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative min-h-[240px] border-t border-white/10 md:border-l md:border-t-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
                      alt="Dashboard görseli"
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-semibold text-white">Satış odaklı vitrin</p>
                      <p className="mt-1 text-xs text-white/70">
                        Premium görünüm, hızlı geçişler, SEO uyumlu sayfalar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="hizmetler" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionTitle
            overline="Hizmetler"
            title="Sektöre özel hazır sistemler + özel geliştirme"
            desc="İhtiyaca göre hazır demoları özelleştiriyor veya sıfırdan özel yazılım geliştiriyoruz."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: "Kuaför Sistemi", desc: "Randevu, müşteri yönetimi, vitrin + panel." },
              { title: "Restoran Sistemi", desc: "QR menü, rezervasyon, masa yönetimi." },
              { title: "Emlak Sistemi", desc: "İlan yönetimi, filtreleme, admin paneli." },
            ].map((x) => (
              <div key={x.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-base font-semibold text-white">{x.title}</p>
                <p className="mt-2 text-sm text-white/70">{x.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                  {["Modern UI", "Panel dahil", "Hızlı kurulum"].map((b) => (
                    <span key={b} className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="demolar" className="mx-auto max-w-6xl px-4 pb-4 pt-8 md:px-6 md:pb-10">
          <SectionTitle
            overline="Demo / Projeler"
            title="Canlı demoları inceleyin"
            desc="Her demoda vitrin + panel akışını görebilirsiniz. İsterseniz aynı altyapıyı işletmenize göre uyarlayalım."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: "Kuaför Demo", href: "/kuafor", meta: "Randevu + panel" },
              { title: "Restoran Demo", href: "/restaurant", meta: "QR menü + rezervasyon" },
              { title: "Emlak Demo", href: "/emlak", meta: "İlan + filtreleme" },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-0.5 hover:bg-white/7 hover:shadow-xl"
              >
                <p className="text-base font-semibold text-white">{p.title}</p>
                <p className="mt-2 text-sm text-white/70">{p.meta}</p>
                <p className="mt-5 text-sm font-semibold text-white">
                  İncele <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id="yorumlar" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionTitle
            overline="Müşteri yorumları"
            title="İşletmeler için hızlı, net ve sürdürülebilir çözümler"
            desc="Örnek yorumlar. Gerçek projelerde süreç, teslim ve destek odaklı çalışıyoruz."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm leading-relaxed text-white/80">“{t.quote}”</p>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-cyan-400/10 p-8 md:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold text-white/70">CTA</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                  İhtiyacınızı anlatın, 24 saat içinde demo planı çıkaralım.
                </p>
                <p className="mt-2 max-w-prose text-sm text-white/70">
                  Kuaför, restoran veya emlak gibi sektörlerde hazır altyapı ile hızlıca başlayabiliriz.
                </p>
              </div>
              <a
                href="#iletisim"
                className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-95"
              >
                Teklif al
              </a>
            </div>
          </div>
        </section>
      </main>

      <MollaFooter />
    </GradientBg>
    </>
  );
}

