import { ayarlarGetir } from "@/lib/settings-store";
import { normalizeExternalUrl } from "@/lib/footer-social-map";
import { whatsappLink } from "@/lib/whatsapp";
import { CookieFooterBar } from "@/components/CookieFooterBar";

function SocialButton(props: { href: string; label: string }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-[12px] font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
    >
      {props.label}
    </a>
  );
}

export async function MollaFooter() {
  const ayar = await ayarlarGetir();
  const phone =
    ayar.iletisimTelefon?.trim() || process.env.NEXT_PUBLIC_MOLLA_PHONE?.trim() || "+90 555 123 45 67";
  const email =
    ayar.iletisimEposta?.trim() || process.env.NEXT_PUBLIC_MOLLA_EMAIL?.trim() || "info@mollayazilim.com";
  const waNum =
    ayar.iletisimWhatsapp?.trim() || process.env.NEXT_PUBLIC_MOLLA_WHATSAPP?.trim() || "905551234567";
  const wa = whatsappLink(waNum, "Merhaba, web sitesi / panel teklifi almak istiyorum.");
  const ig = ayar.instagram?.trim();
  const fb = ayar.facebook?.trim();
  const tw = ayar.twitter?.trim();
  const yt = ayar.youtube?.trim();
  const tt = ayar.tiktok?.trim();
  const li = ayar.linkedin?.trim();

  const igHref = ig ? normalizeExternalUrl(ig) : "";
  const fbHref = fb ? normalizeExternalUrl(fb) : "";
  const twHref = tw ? normalizeExternalUrl(tw) : "";
  const ytHref = yt ? normalizeExternalUrl(yt) : "";
  const ttHref = tt ? normalizeExternalUrl(tt) : "";
  const liHref = li ? normalizeExternalUrl(li) : "";
  const showSocial =
    (ayar.footerSosyalGoster ?? true) &&
    !!(igHref || fbHref || twHref || ytHref || ttHref || liHref);

  return (
    <footer className="mt-auto border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-sm font-semibold text-white">Molla Yazılım</p>
          <p className="mt-2 max-w-prose text-sm text-white/70">
            Özel yazılım çözümleri, admin panelleri ve sektöre özel sistemler. Demo’ları inceleyin; ihtiyacınıza göre
            hızlıca özelleştirelim.
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm font-semibold text-white">İletişim</p>
          {ayar.adresKisa?.trim() ? (
            <p className="mt-2 text-sm text-white/70">
              Konum: <span className="font-medium text-white">{ayar.adresKisa.trim()}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm text-white/70">
            WhatsApp / Telefon: <span className="font-medium text-white">{phone}</span>
          </p>
          <p className="mt-1 text-sm text-white/70">
            E‑posta: <span className="font-medium text-white">{email}</span>
          </p>
          {showSocial ? (
            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
              {igHref ? <SocialButton href={igHref} label="Instagram" /> : null}
              {fbHref ? <SocialButton href={fbHref} label="Facebook" /> : null}
              {twHref ? <SocialButton href={twHref} label="X" /> : null}
              {ytHref ? <SocialButton href={ytHref} label="YouTube" /> : null}
              {ttHref ? <SocialButton href={ttHref} label="TikTok" /> : null}
              {liHref ? <SocialButton href={liHref} label="LinkedIn" /> : null}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-95"
            >
              WhatsApp’tan yazın
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        <CookieFooterBar className="mb-2 text-white/45" />
        © {new Date().getFullYear()} Molla Yazılım — CRM & web sitesi · Tekirdağ Kapaklı
      </div>
    </footer>
  );
}

