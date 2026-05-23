# Mollayazilim (Next.js)

Müşteri sunumu için vitrin + **panel** (`/panel`): randevu talepleri, onay/iptal, **tek tık WhatsApp** (`wa.me`). **4 tema** (header’daki seçici). SEO: metadata, `sitemap.xml`, `robots.txt`, JSON-LD.

## Geliştirme

```bash
npm install
copy .env.example .env.local
npm run dev
```
## Üretim derlemesi

```bash
npm run build
npm run start
```

`next start` varsayılan port **3000**.

## Veri

Randevular `data/randevular.json` dosyasında tutulur (demo). Üretimde IIS uygulama havuzu kullanıcısına bu dosya ve klasör için **yazma** izni verin.

## IIS + mollayazilim.com

1. Proje kökü: `C:\inetpub\wwwroot\mollayazilim` (IIS physical path = bu klasör).
2. **URL Rewrite** ve **ARR** kurulu olsun; ARR’da proxy açık olsun (README’deki `web.config` yorumu).
3. `web.config` site kökünde kalsın.
4. Ortam değişkenleri: `NODE_ENV=production`, `.env.local` veya sistem ortamında `NEXT_PUBLIC_*`, `PANEL_PASSWORD`, `SESSION_SECRET`.
5. Next sürecini sürekli çalıştırın (ör. [NSSM](https://nssm.cc/), PM2, Windows Görev Zamanlayıcı).
