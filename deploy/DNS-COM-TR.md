# mollayazilim.com.tr → Bu sunucu

## DNS (alan adi paneli)

Sunucu dis IP’sini ogren: `curl https://api.ipify.org` veya hosting paneli.

| Tip | Host | Deger |
|-----|------|--------|
| **A** | `@` (kok) | **Sunucu IPv4** |
| **A** veya **CNAME** | `www` | Ayni IP veya `mollayazilim.com.tr` |

Ornek (sunucu IP `188.132.247.107` ise):

- `mollayazilim.com.tr` → A → `188.132.247.107`
- `www.mollayazilim.com.tr` → A → `188.132.247.107`

**Yanlis IP’ye isaret ederse site acilmaz.**  
Kontrol: `nslookup mollayazilim.com.tr` cikti sunucu IP’niz olmali.

## IIS (bu makine)

```powershell
cd C:\inetpub\wwwroot\mollayazilim\deploy
.\Add-ComTr-Bindings.ps1
.\LOCAL-BASLAT.ps1
```

## HTTPS

HTTP calistiktan sonra IIS’te https binding + Let’s Encrypt (win-acme) veya panel sertifikasi.

`.env.production.local` ana domain `.com` kalabilir; `.com.tr` ziyaretinde Host basligindan URL uretilir.
