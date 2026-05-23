# GitHub Actions — neden kirmizi X?

## 1) "No jobs were run" veya Deploy maili

**Sebep:** Eski ayarda push'ta Deploy calisiyordu ama **Secrets yok** — tum job'lar atlaninca GitHub mail atiyordu.

**Simdiki durum:** Deploy workflow **sadece elle** (Actions -> Deploy mollayazilim.com -> Run workflow).  
Her `git push` sadece **CI** (lint + build) calistirir — deploy maili gelmez.

### Otomatik deploy (istege bagli)

Secrets ekledikten sonra `.github/workflows/deploy-mollayazilim.yml` icinde `push:` satirinin yorumunu ac.

Guncelleme VPS'te elle:

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\git-pull.ps1
.\sunucu-guncelle.ps1
```

`git pull origin main` calismiyorsa: `deploy\git-pull.ps1` (klasor / remote / stash duzeltir).

### Otomatik deploy istiyorsan

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Ornek |
|--------|--------|
| `SSH_HOST` | `85.95.251.204` |
| `SSH_USER` | `Administrator` |
| `SSH_KEY` | OpenSSH private key (PEM, tam metin) |
| `DEPLOY_PATH` | `C:/inetpub/wwwroot/mollayazilim` |

VPS'te **OpenSSH Server** acik olmali; firewall **22** acik.

Sonra: **Actions → Deploy mollayazilim.com → Run workflow**

---

## 2) "CI" workflow

Her `main` push'ta: `npm ci` → `lint` → `build`.

Lint/build burada kirmizi ise kod hatasi vardir; loga bak.
