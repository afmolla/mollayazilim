import { normalizeExternalUrl, parseGoogleMapsInput } from "@/lib/footer-social-map";
import { whatsappLink } from "@/lib/whatsapp";
import { ayarlarGetir } from "@/lib/settings-store";
import { menuGetir } from "@/lib/menu-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { FooterNavLinks } from "@/components/FooterNavLinks";

export async function SiteFooter() {
  const ayar = await ayarlarGetir();
  const menu = await menuGetir();
  const qr = await qrMenuGetir();
  const footerItems = qr.yayin
    ? menu.footer
    : menu.footer.filter(
        (n) => !n.href.includes("/qr-menu") && n.href !== "/qr-menu",
      );
  const wa = whatsappLink(ayar.whatsapp, "Merhaba, randevu almak istiyorum.");
  const phone = ayar.iletisimTelefon?.trim();
  const email = ayar.iletisimEposta?.trim();
  const ig = ayar.instagram?.trim();
  const fb = ayar.facebook?.trim();
  const tw = ayar.twitter?.trim();
  const yt = ayar.youtube?.trim();
  const tt = ayar.tiktok?.trim();
  const li = ayar.linkedin?.trim();
  const mapBlock = parseGoogleMapsInput(ayar.googleMaps);
  const igHref = ig ? normalizeExternalUrl(ig) : "";
  const fbHref = fb ? normalizeExternalUrl(fb) : "";
  const twHref = tw ? normalizeExternalUrl(tw) : "";
  const ytHref = yt ? normalizeExternalUrl(yt) : "";
  const ttHref = tt ? normalizeExternalUrl(tt) : "";
  const liHref = li ? normalizeExternalUrl(li) : "";
  const showSocialMap = (ayar.footerSosyalGoster ?? true) && !!(igHref || fbHref || twHref || ytHref || ttHref || liHref || mapBlock);

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface-2)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-semibold text-[var(--text)]">{ayar.salonAd}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {ayar.adresKisa} — {ayar.calismaSaatleri}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Hızlı bağlantılar</p>
          <FooterNavLinks items={footerItems} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text)]">İletişim</p>
          {phone ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Telefon: <span className="font-medium text-[var(--text)]">{phone}</span>
            </p>
          ) : null}
          {email ? (
            <p className={phone ? "mt-1 text-sm text-[var(--muted)]" : "mt-2 text-sm text-[var(--muted)]"}>
              E‑posta: <span className="font-medium text-[var(--text)]">{email}</span>
            </p>
          ) : null}
          <a
            href={wa}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ile yazın
          </a>
        </div>
      </div>

      {showSocialMap ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-[var(--text)]">
              Sosyal medya ve konum
            </h2>

            {(igHref || fbHref || twHref || ytHref || ttHref || liHref) ? (
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {igHref ? (
                  <li>
                    <a
                      href={igHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      Instagram
                    </a>
                  </li>
                ) : null}
                {fbHref ? (
                  <li>
                    <a
                      href={fbHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      Facebook
                    </a>
                  </li>
                ) : null}
                {twHref ? (
                  <li>
                    <a
                      href={twHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      X
                    </a>
                  </li>
                ) : null}
                {ytHref ? (
                  <li>
                    <a
                      href={ytHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      YouTube
                    </a>
                  </li>
                ) : null}
                {ttHref ? (
                  <li>
                    <a
                      href={ttHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      TikTok
                    </a>
                  </li>
                ) : null}
                {liHref ? (
                  <li>
                    <a
                      href={liHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.5rem] min-w-[7rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]/50 hover:text-[var(--brand)]"
                    >
                      LinkedIn
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}

            {mapBlock?.type === "iframe" ? (
              <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
                <iframe
                  title="Konum haritası"
                  src={mapBlock.src}
                  className="h-[min(50vh,320px)] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : mapBlock?.type === "link" ? (
              <div className="mt-8 text-center">
                <a
                  href={mapBlock.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--surface-2)] px-6 py-3 text-sm font-semibold text-[var(--text)] ring-1 ring-[var(--border)] transition hover:ring-[var(--brand)]/40"
                >
                  Haritada aç
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {ayar.salonAd} — SEO uyumlu vitrin + panel demosu
      </div>
    </footer>
  );
}
