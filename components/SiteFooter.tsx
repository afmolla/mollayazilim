import { normalizeExternalUrl, parseGoogleMapsInput } from "@/lib/footer-social-map";
import { whatsappLink } from "@/lib/whatsapp";
import { CookieFooterBar } from "@/components/CookieFooterBar";
import { ayarlarGetir } from "@/lib/settings-store";
import { icerikGetir } from "@/lib/content-store";
import { menuGetir } from "@/lib/menu-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { FooterNavLinks } from "@/components/FooterNavLinks";
import { siteOrigin } from "@/lib/site";
import { resolveDownloadHref } from "@/lib/download-href";

export async function SiteFooter(props?: { ambalaj?: boolean }) {
  const ambalaj = props?.ambalaj ?? false;
  const origin = await siteOrigin();
  const ayar = await ayarlarGetir();
  const icerik = await icerikGetir();
  const menu = await menuGetir();
  const qr = await qrMenuGetir();
  const footerItems = qr.yayin
    ? menu.footer
    : menu.footer.filter(
        (n) => !n.href.includes("/qr-menu") && n.href !== "/qr-menu",
      );
  const wa = whatsappLink(ayar.whatsapp, icerik.iletisim.whatsappMesaj || "Merhaba, bilgi almak istiyorum.");
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
  const socialLinks: { href: string; label: string }[] = [
    ...(igHref ? [{ href: igHref, label: "Instagram" }] : []),
    ...(fbHref ? [{ href: fbHref, label: "Facebook" }] : []),
    ...(twHref ? [{ href: twHref, label: "X" }] : []),
    ...(ytHref ? [{ href: ytHref, label: "YouTube" }] : []),
    ...(ttHref ? [{ href: ttHref, label: "TikTok" }] : []),
    ...(liHref ? [{ href: liHref, label: "LinkedIn" }] : []),
  ];
  const mapHref =
    mapBlock?.type === "link"
      ? mapBlock.href
      : mapBlock?.type === "iframe"
        ? mapBlock.src
        : "";

  const iosStore = ayar.mobilIosIndirUrl?.trim();
  const androidStore = ayar.mobilAndroidIndirUrl?.trim();
  const iosHrefStore = iosStore ? normalizeExternalUrl(iosStore) : "";
  const androidHrefStore = androidStore ? normalizeExternalUrl(androidStore) : "";
  const apkHref = resolveDownloadHref(ayar.mobilAndroidApkUrl, origin);
  const showAppDownloads = !!(iosHrefStore || androidHrefStore || apkHref);

  return (
    <footer
      className={
        ambalaj
          ? "mt-auto border-t border-emerald-500/15 bg-[#061510] text-emerald-50"
          : "mt-auto border-t border-[var(--border)] bg-[var(--surface-2)]"
      }
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className={ambalaj ? "font-semibold text-white" : "font-semibold text-[var(--text)]"}>{ayar.salonAd}</p>
          <p className={ambalaj ? "mt-2 text-sm text-emerald-100/60" : "mt-2 text-sm text-[var(--muted)]"}>
            {ayar.adresKisa} — {ayar.calismaSaatleri}
          </p>
        </div>
        <div>
          <p className={ambalaj ? "text-sm font-medium text-emerald-100" : "text-sm font-medium text-[var(--text)]"}>
            Hızlı bağlantılar
          </p>
          <FooterNavLinks items={footerItems} tone={ambalaj ? "dark" : "light"} />
        </div>
        <div>
          <p className={ambalaj ? "text-sm font-medium text-emerald-100" : "text-sm font-medium text-[var(--text)]"}>
            İletişim
          </p>
          {phone ? (
            <p className={ambalaj ? "mt-2 text-sm text-emerald-100/60" : "mt-2 text-sm text-[var(--muted)]"}>
              Telefon:{" "}
              <span className={ambalaj ? "font-medium text-white" : "font-medium text-[var(--text)]"}>{phone}</span>
            </p>
          ) : null}
          {email ? (
            <p
              className={
                ambalaj
                  ? phone
                    ? "mt-1 text-sm text-emerald-100/60"
                    : "mt-2 text-sm text-emerald-100/60"
                  : phone
                    ? "mt-1 text-sm text-[var(--muted)]"
                    : "mt-2 text-sm text-[var(--muted)]"
              }
            >
              E‑posta:{" "}
              <span className={ambalaj ? "font-medium text-white" : "font-medium text-[var(--text)]"}>{email}</span>
            </p>
          ) : null}
          {showSocialMap ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--brand)]/45 hover:text-[var(--brand)]"
                >
                  {s.label}
                </a>
              ))}
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--brand)]/45 hover:text-[var(--brand)]"
                >
                  Konum
                </a>
              ) : null}
            </div>
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

      {showAppDownloads ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-[var(--text)]">Mobil uygulama</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--muted)]">
              Sipariş vermek için uygulamayı indirin.
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {iosHrefStore ? (
                <li>
                  <a
                    href={iosHrefStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[2.75rem] min-w-[10rem] items-center justify-center rounded-xl bg-[var(--text)] px-5 text-sm font-semibold text-[var(--surface)] transition hover:opacity-90"
                  >
                    App Store
                  </a>
                </li>
              ) : null}
              {androidHrefStore ? (
                <li>
                  <a
                    href={androidHrefStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[2.75rem] min-w-[10rem] items-center justify-center rounded-xl border-2 border-[var(--brand)] bg-[var(--surface-2)] px-5 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
                  >
                    Google Play
                  </a>
                </li>
              ) : null}
              {apkHref ? (
                <li>
                  <a
                    href={apkHref}
                    download
                    className="inline-flex min-h-[2.75rem] min-w-[10rem] items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]/50"
                  >
                    Android APK
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}

      <div
        className={
          ambalaj
            ? "border-t border-emerald-500/10 py-4 text-center text-xs text-emerald-100/50"
            : "border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]"
        }
      >
        <CookieFooterBar className="mb-2" />
        © {new Date().getFullYear()} {ayar.salonAd}
        {icerik.site?.footerEkMetin?.trim() ? ` — ${icerik.site.footerEkMetin.trim()}` : ""}
      </div>
    </footer>
  );
}
