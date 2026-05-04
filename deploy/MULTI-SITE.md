# Çoklu vitrin (`/kuafor`, `/restaurant`)

- **`/`** → yapım sayfası (`proxy.ts`).
- **`/kuafor/*`**, **`/restaurant/*`** → aynı Next uygulaması; veri **`data/kuafor/`** ve **`data/restaurant/`** altında ayrı JSON dosyaları.
- Önek listesi: **`NEXT_PUBLIC_PORTFOLIO_PREFIXES=/kuafor,/restaurant`** (varsayılan bu ikisi). Yalnızca `/kuafor` bırakılırsa **`/restaurant` 404** olur; tüm vitrinler gerekliyse değişkeni kaldırın (varsayılan ikisini kullanır) veya `=/kuafor,/restaurant` yazın.
- Yaygın yazım hatası **`/restaturant`** → uygulama **`/restaurant`** adresine yönlendirir.

Her site için panel oturumu **çerez yolu = site öneki** ile ayrılır (`/kuafor/panel` girişü `/restaurant/panel` ile karışmaz).

Menü `href` değerleri JSON’da **iç rota** olarak durur (`/hizmetler`); tarayıcıda vitrin öneki **`SitePrefixProvider` + `usePrefixedNavHref`** ile eklenir — böylece hangi vitrindesin o vitrinin linkleri kullanılır.

QR menü: **`/…/qr-menu`** — panelde **İçerik → QR menü**; **Yayında** işareti kapalıysa sayfa 404 (menü linkleri gizlenir).
