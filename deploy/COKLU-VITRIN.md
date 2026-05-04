# Tek domainde URL öneki (ör. `/kuafor`)

Next.js **`basePath` kullanılmıyor**; Vercel’de uygulama her zaman **kök `/`** altında deploy edilir (apex 404 riski olmaz).

İsteğe bağlı **`NEXT_PUBLIC_BASE_PATH=/kuafor`**: linkler ve `fetch(withBase(...))` çağrıları `/kuafor/...` üretir. Canlıda bunu kullanmak için reverse proxy veya Vercel rewrite ile **`/kuafor/*` → aynı Next uygulamasının `/*`** eşlemesi gerekir.

- Yerelde `npm run dev`: gateway `http://localhost:3000/kuafor` → Next’e önek kaldırarak iletir.
- Sadece kök vitrin: **`NEXT_PUBLIC_BASE_PATH` vermeyin.**

**Başka bir tasarım (/emlak vb.)** için pratik yöntem:

1. Bu projeyi kopyala → `NEXT_PUBLIC_BASE_PATH=/emlak` yap → proxy’de `/emlak` → uygulama kökü.
2. Aynı sunucuda ikinci `next build` + ayrı process veya ayrı deploy.
3. Reverse proxy’de path eşlemesi.

Aynı Next uygulaması içinde hem /kuafor hem /emlak “route group” ile birleştirmek mümkün ama büyük refaktör; portföyde ayrı kopya + proxy genelde daha temizdir.
