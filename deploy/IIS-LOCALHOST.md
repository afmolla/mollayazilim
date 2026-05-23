# localhost bos / hala :3000 aciyorum

## Neden?

- **http://localhost:3000** = Node dogrudan (npm run dev/start)
- **http://localhost/** = IIS port **80** → arka planda Node **3000** (tarayicida port gorunmez)

IIS'in Node'a baglanmasi icin **ARR (Application Request Routing)** sart.  
Sadece URL Rewrite yuklu; **ARR yoksa localhost 404/bos kalir.**

## Cozum (bir kez, Yonetici)

### 1) ARR kur (otomatik)

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\INSTALL-ARR.ps1
```

veya: `winget install Microsoft.IIS.ApplicationRequestRouting`

### 2) Proxy ac

IIS Yoneticisi → **Sunucu adi** (sol ust) → **Application Request Routing Cache**  
→ **Server Proxy Settings** → **Enable proxy** = **True** → Uygula

### 3) Site ayari

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\LOCALHOST-IIS-DUZELT.ps1
.\LOCAL-BASLAT.ps1
```

### 4) Tarayici

**http://localhost/**  (adres cubugunda **:3000 olmasin**)

## Hizli test

| Adres | Beklenen |
|--------|----------|
| http://127.0.0.1:3000/ | 200 (Node calisiyor) |
| http://localhost/ | 200 (ARR + IIS sonrasi) |

## VPS

Ayni: ARR + `web.config` + PM2. Canli: https://mollayazilim.com

## ARR kurmadan (gecici)

Sadece gelistirme: `npm run dev` → http://localhost:3000  
Canli site IIS ile calisir; yerelde ARR kurana kadar :3000 normal.
