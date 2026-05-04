# Portföy yapısı: kök yapım, `/kuafor` vitrin

- **`/`** → “Yapım aşamasında” (middleware, URL değişmez).
- **`/kuafor`**, **`/kuafor/panel`** vb. → Next uygulaması (middleware rewrite; Next’te `basePath` yok, `/_next` kökte).

**Varsayılan** vitrin öneki: **`/kuafor`** (`NEXT_PUBLIC_BASE_PATH` tanımsızsa).

Sadece kökte tek site (Vercel’de önek istemiyorsanız): ortamda **`NEXT_PUBLIC_BASE_PATH=`** (boş string) verin veya `.env` ile boş bırakın.

Birden fazla alt vitrin için ayrı deploy + farklı `NEXT_PUBLIC_BASE_PATH` (ör. `/emlak`) kullanılabilir.
