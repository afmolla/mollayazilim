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

## Sunucu — 3 CMD

| Dosya | Ne yapar |
|-------|----------|
| **`KUR.cmd`** | İlk kurulum: IIS, npm, build, HTTPS sertifikası, siteyi açar (Yönetici) |
| **`BASLAT.cmd`** | Günlük: PM2 + IIS ile siteyi çalıştırır |
| **`YENIDEN-BASLAT.cmd`** | GitHub'dan çeker, build, PM2 restart — **canlı sunucuda push sonrası** |

> **Önemli:** `git push` tek başına sunucuyu güncellemez. Canlı sunucuda (85.95.251.204) `YENIDEN-BASLAT.cmd` çalıştırın.  
> GitHub Actions SSH secrets tanımlıysa `main` push otomatik deploy eder.

## IIS + mollayazilim.com

1. Proje kökü: `C:\inetpub\wwwroot\mollayazilim` (IIS physical path = bu klasör).
2. **URL Rewrite** ve **ARR** kurulu olsun; ARR’da proxy açık olsun (`web.config`).
3. `web.config` site kökünde kalsın.
4. Ortam: `NODE_ENV=production`, `.env.local` içinde `NEXT_PUBLIC_*`, `PANEL_PASSWORD`, `SESSION_SECRET`.
5. Node süreci PM2 ile `BASLAT.cmd` otomatik başlatır (`deploy\LOCAL-BASLAT.cmd`).
