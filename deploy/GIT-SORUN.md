# git pull calismiyor

## Hizli cozum (git gerekmez)

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\GITHUB-ZIP-GUNCELLE.ps1
.\PM2-DUZELT.ps1
```

veya `GUNCELLE.cmd` cift tik.

---

## git pull

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\git-pull.ps1
```

Cakisma / hata:

```powershell
.\git-pull.ps1 -HardReset
```

---

## Sik nedenler

| Belirti | Cozum |
|---------|--------|
| `.git yok` | ZIP kopyasi — `GITHUB-ZIP-GUNCELLE.ps1` veya `git clone` |
| `fetch failed` | Internet, firewall, private repo token |
| `git` bulunamadi | Git kur veya PATH: `C:\Program Files\Git\cmd` |
| merge conflict | `.\git-pull.ps1 -HardReset` |

## Ilk kez klon

```powershell
cd C:\inetpub\wwwroot
git clone https://github.com/afmolla/mollayazilim.git mollayazilim
cd mollayazilim
npm ci
npm run build
```
