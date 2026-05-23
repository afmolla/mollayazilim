# GitHub repo temizligi

**Kalacak:** `mollayazilim`, `vampir-koylu` (oyun — yerel `C:\inetpub\wwwroot\oyun1`)

**Silinecek repolar:**

| Repo | Neden |
|------|--------|
| [mollyazilim](https://github.com/afmolla/mollyazilim) | Yazim hatasi — yerine mollayazilim |
| [demo](https://github.com/afmolla/demo) | Eski kopya — mollayazilim'de |
| [flutter](https://github.com/afmolla/flutter) | Eski oyun adi — vampir-koylu kullaniliyor |
| [telegram_bot](https://github.com/afmolla/telegram_bot) | Bu proje degil |

## Elle sil (tarayici)

Her repo → **Settings** → en alta **Delete this repository**

## veya gh CLI (bir kez `gh auth login`)

```powershell
gh repo delete afmolla/mollyazilim --yes
gh repo delete afmolla/demo --yes
gh repo delete afmolla/flutter --yes
gh repo delete afmolla/telegram_bot --yes
```

## Yerel disk (bu PC)

Silindi / silinecek:

- `C:\inetpub\wwwroot\eski` — yedek (mollayazilim + demo kopyalari)
- `C:\inetpub\wwwroot\video\pdf-converter-extension` — ayri proje

**Kalacak:**

- `C:\inetpub\wwwroot\mollayazilim`
- `C:\inetpub\wwwroot\oyun1` (vampir-koylu git)
- `C:\inetpub\wwwroot\video\BASLAT-API.cmd` (oyun1'e yonlendirir)
