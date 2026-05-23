# GitHub Actions — neden kirmizi X?

## 1) "Deploy mollayazilim.com" failed

**Sebep:** Workflow VPS'e SSH ile baglanir; **Secrets tanimli degilse** veya yanlis path.

**Site calisiyor olabilir** — bu hata sadece otomatik deploy'un calismadigini gosterir.

### Otomatik deploy istemiyorsan

Hicbir sey yapma. `deploy-mollayazilim.yml` artik Secrets yoksa **job'u atlar** (push sonrasi kirmizi X gelmez).

Guncelleme VPS'te elle:

```powershell
cd C:\inetpub\wwwroot\mollyazilim\deploy
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
| `DEPLOY_PATH` | `C:/inetpub/wwwroot/mollyazilim` |

VPS'te **OpenSSH Server** acik olmali; firewall **22** acik.

Sonra: **Actions → Deploy mollayazilim.com → Run workflow**

---

## 2) "CI" workflow

Her `main` push'ta: `npm ci` → `lint` → `build`.

Lint/build burada kirmizi ise kod hatasi vardir; loga bak.
