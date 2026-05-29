import type { Metadata } from "next";
import Link from "next/link";
import { COOKIE_CATALOG } from "@/lib/cookie-consent";
import { CookieSettingsLink } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "Molla Yazılım çerez politikası — zorunlu, analitik ve işlevsel çerezler hakkında bilgilendirme (KVKK).",
  robots: { index: true, follow: true },
};

export default function CerezPolitikasiPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold text-[var(--text)]">Çerez Politikası</h1>
      <p className="mt-4 text-[var(--muted)] leading-relaxed">
        Bu sayfa, <strong className="text-[var(--text)]">mollayazilim.com</strong> ve bağlı vitrin sitelerinde
        kullanılan çerezler ve benzeri teknolojiler hakkında bilgi verir. 6698 sayılı Kişisel Verilerin Korunması
        Kanunu (KVKK) kapsamında bilgilendirme amaçlıdır.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--text)]">Çerez nedir?</h2>
        <p className="mt-3 text-[var(--muted)] leading-relaxed">
          Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Oturum
          güvenliği, tercihlerinizin hatırlanması ve site kullanım istatistikleri için kullanılabilir.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--text)]">Çerez kategorileri</h2>
        <div className="mt-4 space-y-6">
          {COOKIE_CATALOG.map((cat) => (
            <article
              key={cat.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
            >
              <h3 className="font-semibold text-[var(--text)]">
                {cat.title}
                {cat.required ? (
                  <span className="ml-2 text-xs font-normal text-[var(--muted)]">(zorunlu)</span>
                ) : null}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{cat.description}</p>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="pb-2 pr-2 font-medium">Ad</th>
                    <th className="pb-2 pr-2 font-medium">Amaç</th>
                    <th className="pb-2 font-medium">Süre</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.cookies.map((c) => (
                    <tr key={c.name} className="border-b border-[var(--border)]/60">
                      <td className="py-2 pr-2 font-mono text-xs text-[var(--text)]">{c.name}</td>
                      <td className="py-2 pr-2 text-[var(--muted)]">{c.purpose}</td>
                      <td className="py-2 text-[var(--muted)]">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--text)]">Tercihlerinizi yönetme</h2>
        <p className="mt-3 text-[var(--muted)] leading-relaxed">
          İlk ziyarette gösterilen banner üzerinden &quot;Tümünü kabul et&quot;, &quot;Sadece gerekli&quot; veya
          &quot;Ayarlar&quot; seçeneklerini kullanabilirsiniz. Daha sonra{" "}
          <CookieSettingsLink className="font-medium text-[var(--brand)] underline hover:opacity-90" /> bağlantısından
          tercihlerinizi güncelleyebilirsiniz.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--text)]">İletişim</h2>
        <p className="mt-3 text-[var(--muted)] leading-relaxed">
          Çerezler ve kişisel verileriniz hakkında sorularınız için{" "}
          <a href="mailto:info@mollayazilim.com" className="text-[var(--brand)] underline">
            info@mollayazilim.com
          </a>{" "}
          adresine yazabilir veya{" "}
          <Link href="/#iletisim" className="text-[var(--brand)] underline">
            iletişim formu
          </Link>
          iletişim formunu kullanabilirsiniz.
        </p>
      </section>

      <p className="mt-12 text-sm text-[var(--muted)]">
        <Link href="/" className="text-[var(--brand)] underline">
          ← Ana sayfa
        </Link>
      </p>
    </main>
  );
}
