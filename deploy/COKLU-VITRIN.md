# Tek domainde birden fazla demo (/kuafor, ileride /emlak)

Alt dizinde yayın için build / Vercel ortamında **`NEXT_PUBLIC_BASE_PATH=/kuafor`** (isteğe bağlı aynı değer **`BASE_PATH`**) ayarlayın; kaynak: `lib/base-path.ts`.

- Canlı adres örneği: `https://mollayazilim.com/kuafor/anasayfa`, `.../kuafor/panel`
- Ayrı Vercel projesi kök domainde: **`NEXT_PUBLIC_BASE_PATH` vermeyin** (boş = uygulama kök `/` altında).
- `NEXT_PUBLIC_SITE_URL=https://mollayazilim.com` yeterli; alt dizinde tam kanonik URL `siteUrl()` ile `.../kuafor` olarak üretilir.

**Başka bir tasarım (/emlak vb.)** için pratik yöntem:

1. Bu projeyi kopyala → `NEXT_PUBLIC_BASE_PATH=/emlak` yap → içerik/marka dosyalarını o senaryoya göre değiştir.
2. Aynı sunucuda ikinci `next build` + ayrı process (farklı port) veya ayrı deploy.
3. Reverse proxy’de `/emlak` isteğini ikinci uygulamaya yönlendir.

Aynı Next uygulaması içinde hem /kuafor hem /emlak “route group” ile birleştirmek mümkün ama büyük refaktör; portföyde ayrı kopya + ayrı alt yol genelde daha temizdir.
