import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isLocalHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.trim();
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(h);
}

/** Yerelde `/` açıldığında yapım ekranı; canlıda `/anasayfa` yönlendirmesi */
export default async function MarketingRootPage() {
  const h = await headers();
  /** Doğrudan bağlantıda `host` doğru; bazı proxy'lerde `x-forwarded-host` yanlış öncelenebilir */
  const host = h.get("host") ?? h.get("x-forwarded-host");

  if (!isLocalHost(host)) {
    redirect("/anasayfa");
  }

  const year = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b0b0e] p-6 text-[#e4e4e7]">
      <div className="max-w-md rounded-2xl border border-white/[0.08] bg-[#18181b] px-8 py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <p className="mb-5 inline-block rounded-full bg-[rgba(167,139,250,0.12)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#a78bfa]">
          Yapım aşamasında
        </p>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          <span className="text-[#a78bfa]">Sayfa</span> yapım aşamasındadır
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
          Geliştirme ortamındasınız. Canlı vitrin için bu adres yerine barındırılmış siteyi kullanın.
        </p>
        <p className="mt-6 border-t border-white/[0.06] pt-5 text-xs text-[#71717a]">
          © {year} — localhost
        </p>
      </div>
    </div>
  );
}
