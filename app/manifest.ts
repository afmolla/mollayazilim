import type { MetadataRoute } from "next";

/** PWA / mobil tarayıcı “Ana ekrana ekle” ve marka adı için manifest */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Molla Yazılım — Web sitesi & özel yazılım",
    short_name: "Molla Yazılım",
    description:
      "İşletmeye özel web sitesi, admin panel ve sektörel hazır sistemler. İstanbul ve Türkiye geneli.",
    start_url: "/",
    display: "standalone",
    background_color: "#070616",
    theme_color: "#070616",
    lang: "tr",
    dir: "ltr",
    categories: ["business", "productivity", "developer"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
