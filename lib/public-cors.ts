/**
 * Expo / mobil istemciler farklı origin'den API çağırabilir.
 * Üretimde `MOBILE_CORS_ORIGIN` ile kısıtlayın (ör. `https://mollayazilim.com` veya tekil uygulama domaini).
 */
export function publicCorsHeaders(): Record<string, string> {
  const origin = process.env.MOBILE_CORS_ORIGIN?.trim() || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-site-prefix, x-data-subdir, x-app-version",
    Vary: "Origin",
  };
}
