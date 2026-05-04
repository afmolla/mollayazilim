# Çoklu vitrin (`/kuafor`, `/restaurant`)

- **`/`** → yapım sayfası (`proxy.ts`).
- **`/kuafor/*`**, **`/restaurant/*`** → aynı Next uygulaması; veri **`data/kuafor/`** ve **`data/restaurant/`** altında ayrı JSON dosyaları.
- Önek listesi: **`NEXT_PUBLIC_PORTFOLIO_PREFIXES=/kuafor,/restaurant`** (varsayılan bu ikisi).

Her site için panel oturumu **çerez yolu = site öneki** ile ayrılır (`/kuafor/panel` girişü `/restaurant/panel` ile karışmaz).

QR menü: **`/…/qr-menu`** — panelde **İçerik → QR menü**; **Yayında** işareti kapalıysa sayfa 404 (menü linkleri gizlenir).
