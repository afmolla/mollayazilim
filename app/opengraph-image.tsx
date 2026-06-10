import { ImageResponse } from "next/og";

export const alt = "Molla CRM — Tekirdağ Kapaklı müşteri takip ve satış yönetimi yazılımı";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

/** Sosyal paylaşım ve Google sonuçları için varsayılan OG görseli (1200×630). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 42%, #4c1d95 100%)",
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #a855f7, #06b6d4)",
            }}
          />
          <span style={{ fontSize: 52, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
            Molla Yazılım
          </span>
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 920,
            lineHeight: 1.25,
          }}
        >
          CRM programı · Müşteri takip · Satış pipeline · Tekirdağ Kapaklı
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Ücretsiz keşif · Hızlı demo · SEO uyumlu teslim
        </div>
      </div>
    ),
    { ...size },
  );
}
