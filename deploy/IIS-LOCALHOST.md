# IIS modu — port 80 (localhost / mollayazilim.com)

Vercel yok. Tarayici **asla `:3000` gostermez**.

```
Tarayici  ->  IIS :80 / :443  ->  Node 127.0.0.1:3000 (PM2, sadece sunucu icinde)
```

## Yerel

1. **Yonetici** bir kez: `deploy\Install-Mollayazilim-NextIIS.ps1`
2. `deploy\LOCAL-BASLAT.ps1` veya `MOLLAYAZILIM-LOCALHOST.cmd`
3. Ac: **http://localhost/**

## VPS / canli

- **https://mollayazilim.com** (DNS -> sunucu)
- Ayni IIS + PM2 mantigi

## .env

| Ortam | `NEXT_PUBLIC_SITE_URL` |
|--------|-------------------------|
| Yerel IIS | `http://localhost` |
| Canli | `https://mollayazilim.com` |

## 502 Bad Gateway

PM2 / Node ayakta degil:

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\LOCAL-BASLAT.ps1
```

## Gelistirme (hot reload)

IIS uzerinden uretim build kullanilir. Kod degisince:

```powershell
npm run build
pm2 restart mollayazilim
```

Gelistirme icin istege bagli `npm run dev` (:3000) — sadece gelistirici; normal kullanim `http://localhost/`.
