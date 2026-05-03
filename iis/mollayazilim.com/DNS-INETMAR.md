# mollayazilim.com → Bu sunucuya yönlendirme

Alan adı **inetmar** (veya satın aldığınız firma) panelinde DNS düzenlenir. Sunucu tarafında IIS sitesi zaten `mollayazilim.com` için hazır; yapılacak tek şey **DNS kayıtlarını sunucu IP’nize çekmek**.

## Bilmeniz gereken tek şey

Sunucunuzun **dışarıdan görünen IPv4 adresi** (Windows sunucuda PowerShell):

```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
```

veya modem/hosting panelinden “sunucu IP”. Bu IP’yi aşağıda **A kaydı** olarak yazacaksınız.

## inetmar / çoğu Türk panelinde tipik adımlar

1. Giriş yapın → **Alan adım** / **Domain listesi** → **mollayazilim.com**
2. **DNS yönetimi** / **DNS kayıtları** / **Zone editor** bölümünü açın.
3. Şu kayıtları ekleyin veya güncelleyin:

| Tür (Type) | İsim / Host | Değer / Hedef        | TTL   |
|-------------|-------------|----------------------|-------|
| **A**       | `@` veya boş veya `mollayazilim.com` | **Sunucu IPv4** | 3600 |
| **A**       | `www`       | **Aynı IPv4** (veya aşağıdaki CNAME) | 3600 |

İsterseniz:

| **CNAME** | `www` | `mollayazilim.com.` | 3600 |

(CNAME ile `www` ana domain adına işaret eder; sonunda nokta bazen gerekir.)

4. Eski **park** veya **yinelenen A** kayıtları varsa (başka bir IP’ye giden) silin veya düzeltin.
5. Kaydedin. Yayılım **birkaç dakika–48 saat** sürebilir (çoğu zaman 15–60 dk).

## IIS tarafı (bu makinede)

- Site fiziksel yol: bu klasör (`index.html` yapım sayfası).
- **HTTP (80)** için binding’de ana bilgisayar adı: `mollayazilim.com` olmalı.
- **HTTPS** kullanacaksanız: DNS düzgün çözüldükten sonra IIS’te **443** bağlaması + **sertifika** (Let’s Encrypt win-acme vb.) ekleyin.

## Kontrol

DNS yayılınca (bilgisayarınızdan):

```powershell
nslookup mollayazilim.com
```

Çıkan adres sunucu IP’niz olmalı. Tarayıcıdan `http://mollayazilim.com` → yapım sayfası görünmeli.

## Sorun giderme

- **Hâlâ eski sayfa / başka hosting:** Tarayıcı önbelleği veya eski A kaydı; `nslookup` ile IP’yi doğrulayın.
- **inetmar “nameserver” başka yere yönlü:** DNS’i nerede yönettiğinize bakın (inetmar mı, Cloudflare mı). Kayıtları **aktif DNS sunucusunun** olduğu panelde değiştirin.
- **Sadece www çalışıyor:** `@` için A kaydı eksik olabilir; ekleyin.
