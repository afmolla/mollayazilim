# Inetmar hosting’e dosya yükleme

Ben (Cursor / yerel proje) inetmar paneline **giriş yapamam**; yükleme **sizin FTP veya dosya yöneticisi** ile yapılır. Aşağıdaki iki senaryodan hangisi size verildiyse onu izleyin.

---

## A) Paylaşımlı hosting (cPanel / Plesk / “Dosya yöneticisi”)

Genelde kök klasör adları: **`public_html`**, **`httpdocs`**, **`www`**.

1. Inetmar panelinde **FTP bilgileri** veya **Dosya yöneticisi** bölümünü açın.
2. **Kullanıcı adı, şifre, sunucu (FTP host)** not edin; FileZilla, WinSCP veya Plesk/cPanel “Dosya yöneticisi” ile bağlanın.
3. Site köküne (çoğu zaman `public_html`) yükleyin:
   - Yalnızca **statik “yapım aşamasında” sayfası** için: `iis/mollayazilim.com` içindeki **`index.html`** ve gerekirse **`web.config`** (IIS/Windows’ta) — Apache’de `.htaccess` gerekirse ayrıca eklenir.
4. Yükleme sonrası: `https://mollayazilim.com` (veya verilen test adresi) açılır.

**Not:** Bu Next.js proje **tarayıcıda `npm start` + Node** ister. Klasik **sadece PHP** paylaşımlı hosting’de tüm proje (API, panel, dinamik sayfalar) **çalışmaz**; ya **Node destekli paket** ya da **Kendi sunucunuz (VPS / mevcut Windows + IIS)** gerekir.

---

## B) Bu projeyi “tam” çalıştırmak (Node + Next.js)

Gerekenler: sunucuda **Node.js 20+**, proje klasörü, ardından:

```bash
npm ci
npm run build
set NODE_ENV=production
npm run start
```

Port **3000** (veya verilen) dinlenir; önünde **IIS ters vekil** veya **Nginx** ile 80/443 yönlendirmesi.

Şu an geliştirdiğiniz kopya zaten **Windows + IIS** (`C:\inetpub\wwwroot\mollayazilim`) üzerinde bu mantıkla çalışmaya uygun. Inetmar’ın “hosting”i paylaşımlı ve Node yoksa, **aynı dosyaları oraya atarak** panel sitesini açamazsınız.

---

## Özet

| Hedef | Ne yükleyeceksiniz | Nereye |
|--------|--------------------|--------|
| Sadece “yapım aşamasında” tek sayfa | `index.html` (ve sunucu türüne göre `web.config` / `.htaccess`) | `public_html` (veya inetmar’ın gösterdiği web kökü) |
| Tüm site (kuaför panel, API, sayfalar) | Node + build; paylaşımlı hosting yetersizse **VPS / Node’lu plan** | Sunucuda SSH veya sizin mevcut Windows sunucu |

Inetmar’ın e-postasında **“Node.js”**, **“SSH”**, **“Uygulama çalıştırma”** var mı kontrol edin; yoksa tam site için **şu anki gibi kendi sunucunuz** veya Node’lu bir paket seçmek gerekir.

FTP host / kullanıcı adı gibi bilgileri **sadece sizin panelinizde** görürsünüz; bana şifre vermeyin, güvenlik riski oluşturur.
