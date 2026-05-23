# mollayazilim.com — sunucu kurulum (GitHub → IIS)

Repo: **https://github.com/afmolla/mollayazilim.git**  
Uygulama klasörü: **`C:\inetpub\wwwroot\mollayazilim`**

---

## Sunucuda localhost bos (PC'de calisiyor)

VPS/RDP icinde **Yonetici** PowerShell:

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
# Eski klasor adi ise:
# $env:MOLLAYAZILIM_ROOT = "C:\inetpub\wwwroot\mollyazilim"
.\SUNUCU-LOCALHOST-TAM.ps1
```

veya `SUNUCU-LOCALHOST.cmd` (UAC onayla). ARR + IIS binding + PM2 + test yapar.

---

## Yerelde test (IIS — port 80)

Tarayıcı: **http://localhost/** (adres cubugunda **:3000 yok**)

```powershell
# Bir kez (Yonetici):
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\Install-Mollayazilim-NextIIS.ps1

# Her acilis:
.\LOCAL-BASLAT.ps1
```

veya `MOLLAYAZILIM-LOCALHOST.cmd`

**Nasil calisir:** IIS (80/443) -> arka planda Node `127.0.0.1:3000` (PM2). Vercel yok.

> Vampir oyun API ayni makinede **3100** kullanir. 3000 sadece IIS ic proxy.

---

## Sunucuda ilk kurulum (Windows + IIS)

### 1) Yazılımlar

- Node.js 20+
- Git
- IIS: **URL Rewrite** + **ARR** (proxy açık: `Enable proxy = true`)

### 2) Projeyi klonla

```powershell
cd C:\inetpub\wwwroot
git clone https://github.com/afmolla/mollayazilim.git mollayazilim
cd mollayazilim
copy .env.example .env.production.local
notepad .env.production.local
```

Doldur: `NEXT_PUBLIC_SITE_URL`, `PANEL_PASSWORD`, `SESSION_SECRET`

### 3) Build + sürekli Node (port 3000)

```powershell
cd C:\inetpub\wwwroot\mollayazilim
npm ci
npm run build
npm install -g pm2
pm2 start deploy\ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4) IIS — domain tam site (Next proxy)

**Yönetici** PowerShell:

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\Install-Mollayazilim-NextIIS.ps1
```

Bu, site kökünü **`C:\inetpub\wwwroot\mollayazilim`** yapar (`web.config` → `127.0.0.1:3000`).

> Eski “Yakında” statik sayfa: `iis\mollayazilim.com\` — artık kullanılmaz.

### 5) DNS

`mollayazilim.com` ve `www` → sunucu **A kaydı** (`iis\mollayazilim.com\DNS-INETMAR.md`)

### 6) HTTPS

IIS → site bağlaması **https** + sertifika (win-acme / Let’s Encrypt).

---

## Güncelleme (git push → sunucu)

PC’de push:

```powershell
cd C:\inetpub\wwwroot\mollayazilim
git add .
git commit -m "..."
git push origin main
```

Sunucuda:

```powershell
powershell -ExecutionPolicy Bypass -File C:\inetpub\wwwroot\mollayazilim\deploy\sunucu-guncelle.ps1
```

### Otomatik (GitHub Actions)

`.github/workflows/deploy-mollayazilim.yml` — repo **Secrets**:

| Secret | Örnek |
|--------|--------|
| `SSH_HOST` | sunucu IP |
| `SSH_USER` | Administrator |
| `SSH_KEY` | özel anahtar (PEM) |
| `DEPLOY_PATH` | `C:/inetpub/wwwroot/mollayazilim` |

Push `main` → sunucuda `sunucu-guncelle.ps1` çalışır.

### Otomatik (sunucu içi, GitHub’sız)

Görev Zamanlayıcı → her 5 dk:

```powershell
powershell -ExecutionPolicy Bypass -File C:\inetpub\wwwroot\mollayazilim\deploy\sunucu-guncelle.ps1
```

---

## Kontrol

```powershell
curl http://localhost/
cd C:\inetpub\wwwroot\mollayazilim\iis\mollayazilim.com
.\Kontrol-IIS.ps1
```

### Site / localhost acilmiyor veya IIS 502

**Semptom:** `http://localhost/` veya domain acilmiyor; IIS 502.

**Sebep:** Node (PM2) arka planda ayakta degil. IIS sadece proxy; Node `127.0.0.1:3000` (disariya acilmaz).

**Tek komut (VPS’te PowerShell):**

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\VPS-BASLAT.ps1
```

İlk kez (klasör yoksa):

```powershell
.\VPS-BASLAT.ps1 -IlkKurulum
```

Sonra `.env.production.local` içinde `PANEL_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL=https://mollayazilim.com` doldur.

| Hata | Çözüm |
|------|--------|
| Port 3000 dolu (Vampir API) | `VPS-BASLAT.ps1` portu temizler; API `3100` kullanmalı |
| `npm run build` hata | Node 20+, `npm ci` tekrar |
| PM2 yok | `npm install -g pm2` |
| IIS 502, localhost OK | `Install-Mollayazilim-NextIIS.ps1` + ARR proxy açık |

IIS 502 → Node/PM2 çalışmıyor.  
IIS statik “Yakında” → `Install-Mollayazilim-NextIIS.ps1` henüz çalıştırılmamış.
