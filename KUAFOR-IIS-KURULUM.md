## Kuafor (Next.js) — IIS Kurulum Kontrol Listesi

Bu proje IIS üzerinde **ARR (Application Request Routing) + URL Rewrite** ile, çalışan bir Next.js sunucusuna **reverse proxy** şeklinde yayınlanır.

### 1) IIS tarafı (zorunlu)

- **URL Rewrite** modülü kurulu olmalı.
- **Application Request Routing (ARR)** kurulu olmalı.
- IIS Manager → Sunucu → **Application Request Routing Cache** → **Server Proxy Settings…**
  - **Enable proxy**: **true**
  - (Varsa) **Preserve client IP**: açık

### 2) Site ayarları

- **Site Physical Path**: `C:\inetpub\wwwroot\kuafor`
- **Binding**: `kuafor.com` (http/https)
- **Application Pool**:
  - **.NET CLR version**: **No Managed Code**
  - Identity: varsayılan `ApplicationPoolIdentity` olabilir

### 3) Next.js servisinin ayakta olması (zorunlu)

IIS sadece proxy yapar; asıl uygulama `127.0.0.1:3000` üzerinde çalışıyor olmalı.

Projede:

```powershell
cd C:\inetpub\wwwroot\kuafor
npm ci
npm run build
$env:NODE_ENV="production"
npm run start
```

Kalıcı çalıştırmak için Windows Service (NSSM) veya PM2 önerilir.

### 4) Ortam değişkenleri

`.env.example` içindekileri IIS ortamına (veya `.env.production`) taşıyın:

- `NEXT_PUBLIC_SITE_URL=https://kuafor.com`
- `NEXT_PUBLIC_SALON_AD=...`
- `NEXT_PUBLIC_WHATSAPP_SALON=...`
- `PANEL_PASSWORD=...`
- `SESSION_SECRET=...` (üretimde güçlü, uzun)

### 5) En sık hata senaryoları

- **404 / boş sayfa**: URL Rewrite kurulu değil veya `web.config` okunmuyor.
- **502.3 Bad Gateway**: `127.0.0.1:3000` tarafında Next.js process çalışmıyor.
- **Sonsuz yönlendirme / yanlış canonical**: `NEXT_PUBLIC_SITE_URL` yanlış veya `X-Forwarded-Proto` ile şema doğru iletilmiyor.

