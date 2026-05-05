# Proje kod haritası (site map)

Bu dosya **SEO `sitemap.xml` değildir**; geliştirici için “neyi nerede bulurum” özeti. Tüm projeyi taramadan sorun çözme / özellik ekleme için kullanın.

## Zihinsel model

- **Tek Next.js deploy**, birden fazla “vitrin”: kök `/` (Molla kurumsal) + önekli vitrinler `/kuafor`, `/restaurant`, `/emlak`.
- **`proxy.ts`**: Tarayıcı URL’sini iç route’a **rewrite** eder; `x-site-prefix`, `x-data-subdir`, `x-vitrin-url-path` header’ları ile hangi sitenin (`data/{slug}/`) yükleneceği belli olur.
- **Panel**: `/panel` = kök site (Molla) paneli; `/kuafor/panel` = kuaför verisi. Oturum çerezi yolu `/` (tüm paneller aynı `PANEL_PASSWORD` ile açılır, veri klasörü isteğe göre değişir).

## Klasörler (üst seviye)

| Yol | Rol |
|-----|-----|
| `app/` | App Router: sayfalar, layout’lar, `api/` route handler’lar |
| `components/` | UI ve panel bileşenleri (domain alt klasörleri: `molla/`, `vf-inline/`) |
| `lib/` | İş mantığı, dosya store’ları, site öneki, oturum |
| `data/` | JSON veri; site başına alt klasör (`molla`, `kuafor`, …) + kökte legacy dosyalar |
| `proxy.ts` | Çoklu site rewrite + istek header’ları |
| `public/` | Statik dosyalar |
| `scripts/` | Build/dev yardımcıları |

---

## `app/` — Sayfalar

| Dosya / segment | Ne işe yarar |
|------------------|---------------|
| `app/layout.tsx` | Kök layout, font, tema, **statik metadata** (async metadata burada yok) |
| `app/globals.css` | Tailwind, tema değişkenleri, `--header-h`, scroll ayarları |
| `app/page.tsx` | **`/`** Molla kurumsal landing (navbar, demolar, iletişim, lead form) |
| `app/panel/page.tsx` | Panel shell; giriş yoksa `PanelLogin`, varsa `PanelApp` |
| `app/panel/layout.tsx` | Panel üst bar, “Siteye dön”, `SitePrefixProvider` |
| `app/(marketing)/layout.tsx` | Vitrin sayfaları: header/footer, SEO `generateMetadata`, analytics |
| `app/(marketing)/anasayfa/page.tsx` | Şablon vitrin ana sayfa (`/…/anasayfa`) |
| `app/(marketing)/hizmetler`, `galeri`, `iletisim`, `randevu`, `randevular`, `qr-menu` | İlgili vitrin sayfaları |
| `app/(marketing)/p/[slug]/page.tsx` | CMS sayfa şablonu |
| `app/sitemap.ts` | Üretim **sitemap.xml** (SEO) |
| `app/robots.ts` | robots.txt |

---

## `app/api/` — API (gruplar)

| Grup | Örnek yol | Not |
|------|-----------|-----|
| Kimlik | `api/auth/login`, `logout` | `lib/session.ts`, `PANEL_PASSWORD` |
| Genel lead | `api/lead` | `lib/lead-store.ts` |
| Panel (oturum gerekli) | `api/panel/settings`, `content`, `menus`, `pages`, `media`, `randevular`, `backup`, `analytics`, `qr-menu`, `leads`, `session` | Çoğu `lib/*-store.ts` + `withSiteFromRequest` |
| Vitrin | `api/randevu`, `api/track` | Randevu / izleme |

**Site bağlamı:** `lib/api-site-context.ts` (`withSiteFromRequest`) — hangi `data/{subdir}` kullanılacağını header/path/referer ile seçer.

---

## `lib/` — Önemli modüller

| Dosya | Kısa açıklama |
|-------|----------------|
| `site-config.ts` | `portfolioPrefixes()`, önek ↔ `data` slug |
| `base-path.ts` | URL’den önek çıkarma, `withBase`, vitrin linkleri |
| `site-request.ts` | RSC’de `getRequestSite()` (proxy header’ları) |
| `site-proxy-headers.ts` | `x-vitrin-url-path`, Molla sentinel |
| `api-site-context.ts` | API isteklerinde site alt dizini |
| `settings-store.ts` | `SiteAyarlar`, `data/.../settings.json` |
| `session.ts` | Panel çerezi `kuafor_panel`, path `/` |
| `data-dir.ts` | `getDataDir()` → `data/{subdir}` |
| `*-store.ts` | İlgili domain (menu, media, pages, randevu, lead, …) |
| `panel-deeplink.ts` | Panel sekme / görsel düzen deep link |
| `footer-social-map.ts`, `whatsapp.ts` | İletişim / harita / WhatsApp |

---

## `components/` — Gruplama

| Alan | Bileşenler |
|------|------------|
| **Molla `/`** | `molla/MollaNavbar`, `MollaFooter`, `MollaLeadForm`, `GradientBg` |
| **Vitrin ortak** | `SiteHeader`, `SiteFooter`, `SiteNavLinks`, `MobileNav`, `SideNav`, `SitePrefixProvider` |
| **Panel** | `PanelApp`, `PanelLogin`, `PanelSettings`, `PanelSeo`, `PanelPortfoyHub`, `PanelDashboard`, `PanelLeads`, … |
| **Görsel düzen** | `SiteEditModeHost`, `vf-inline/*` (sayfa içi düzen) |
| **Diğer** | `JsonLd`, `ThemeProvider`, `VfAnalyticsTracker` |

---

## `data/` — Veri

| Klasör | Site |
|--------|------|
| `data/molla/` | Kök `/` kurumsal site ayarları (`settings.json`), lead meta vb. |
| `data/kuafor/`, `data/restaurant/`, `data/emlak/` | Önekli vitrinlerin ayarları, menü, içerik, medya, randevu… |
| `data/*.json` (kök) | Eski/ortak yedek; yeni işler mümkünse site alt klasörüne |

---

## Sık değişenler — nereye dokunulur?

| İhtiyaç | Yer |
|---------|-----|
| Kurumsal ana sayfa metni / hero | `app/page.tsx`, `data/molla/settings.json` |
| SEO (vitrin) | `app/(marketing)/layout.tsx` `generateMetadata`, panel **SEO** sekmesi |
| Panel şifresi | Ortam: `PANEL_PASSWORD` (bkz. `.env.example`) |
| Çoklu site önekleri | `NEXT_PUBLIC_PORTFOLIO_PREFIXES`, `lib/site-config.ts` |
| Header / banner boşluğu | `app/page.tsx` (spacer), `globals.css` `--header-h`, `molla/MollaNavbar.tsx` |
| Yeni API | `app/api/.../route.ts` + genelde `withSiteFromRequest` + ilgili `lib/*-store` |

---

## Okuma sırası önerisi (yeni özellik)

1. İstek URL’si hangi site? → `proxy.ts` + `lib/site-request.ts` / `base-path.ts`  
2. Veri hangi klasörden? → `lib/data-dir.ts` + `data/{subdir}`  
3. UI hangi segmentte? → `app/page.tsx` vs `app/(marketing)/...`  
4. Panel mi vitrin mi? → `app/panel/*` vs `components/Panel*.tsx`

Bu dosyayı güncel tutmak: yeni büyük klasör veya kalıcı route eklendiğinde bir satır eklemeniz yeterli.
