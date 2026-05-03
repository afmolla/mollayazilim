# Kuaför demo (Next.js)

Müşteri sunumu için vitrin + **panel** (`/panel`): randevu talepleri, onay/iptal, **tek tık WhatsApp** (`wa.me`). **4 tema** (header’daki seçici). SEO: metadata, `sitemap.xml`, `robots.txt`, JSON-LD.

## Geliştirme

```bash
npm install
copy .env.example .env.local
npm run dev
```

Varsayılan panel şifresi `.env.example` içindeki `PANEL_PASSWORD` ile aynıdır.

## Üretim derlemesi

```bash
npm run build
npm run start
```

`next start` varsayılan port **3000**.

## Veri

Randevular `data/randevular.json` dosyasında tutulur (demo). Üretimde IIS uygulama havuzu kullanıcısına bu dosya ve klasör için **yazma** izni verin.

## IIS + `kuafor.com`

1. Bu klasörü `C:\inetpub\wwwroot\kuafor` altına kopyalayın (veya site kökü olarak bu dizini gösterin).
2. **URL Rewrite** ve **ARR** kurulu olsun; ARR’da proxy açık olsun (README’deki `web.config` yorumu).
3. `web.config` site kökünde kalsın.
4. Ortam değişkenleri: `NODE_ENV=production`, `.env.local` veya sistem ortamında `NEXT_PUBLIC_*`, `PANEL_PASSWORD`, `SESSION_SECRET`.
5. Next sürecini sürekli çalıştırın (ör. [NSSM](https://nssm.cc/), PM2, Windows Görev Zamanlayıcı).

Site adresi SEO için **mutlaka** `NEXT_PUBLIC_SITE_URL=https://kuafor.com` olmalı.

## Güvenlik notu

Demo şifre ve dosya tabanlı depolama üretim için yetersizdir; gerçek müşteride veritabanlı ve güçlü kimlik doğrulama kullanın.

## Durum

`npm run build` ve `npm run lint` bu depoda sorunsuz çalışıyor. `inetpub\wwwroot\kuafor` altına kopya: aynı dosyaları ( `node_modules` hariç ) oraya aldıktan sonra hedef dizinde `npm install` ve `npm run build` çalıştırın.
