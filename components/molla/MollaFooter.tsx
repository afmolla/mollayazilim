"use client";

export function MollaFooter() {
  return (
    <footer id="iletisim" className="border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-sm font-semibold text-white">Molla Yazılım</p>
          <p className="mt-2 max-w-prose text-sm text-white/70">
            Özel yazılım çözümleri, admin panelleri ve sektöre özel sistemler.
            Demo’ları inceleyin; ihtiyacınıza göre hızlıca özelleştirelim.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm font-semibold text-white">İletişim</p>
          <p className="mt-2 text-sm text-white/70">
            WhatsApp / Telefon: <span className="font-medium text-white">+90 555 123 45 67</span>
          </p>
          <p className="mt-1 text-sm text-white/70">
            E‑posta: <span className="font-medium text-white">info@mollayazilim.com</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Molla Yazılım — Özel yazılım & panel çözümleri
      </div>
    </footer>
  );
}

