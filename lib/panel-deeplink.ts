import type { PanelContentTab } from "@/components/PanelContent";
import { stripBasePath, withBase } from "@/lib/base-path";

/** Panel «İçerik» sekmesinde açılacak hedef (URL vf_* parametrelerinden) */
export type VfIcerikSnapshot = { sablon?: PanelContentTab; slug?: string };

/** Panel sol menü id’leri (PanelApp ile uyumlu) */
export type PanelNavTabId = "randevular" | "icerik" | "medya" | "menuler" | "ayarlar" | "yedek" | "site_duzenle";

/**
 * Vitrin pathname → Panel derin bağlantısı (İçerik sekmesinde doğru sayfayı açar).
 */
export function panelEditUrlFromPathname(pathname: string): {
  href: string;
  /** Kullanıcıya gösterilecek kısa açıklama */
  label: string;
} {
  const p = stripBasePath(pathname).replace(/\/+$/, "") || "/";

  if (p === "/" || p === "/anasayfa") {
    return {
      href: withBase("/panel?vf_tab=icerik&vf_sablon=home"),
      label: "Anasayfa şablonu",
    };
  }
  if (p === "/hizmetler") {
    return {
      href: withBase("/panel?vf_tab=icerik&vf_sablon=hizmetler"),
      label: "Hizmetler şablonu",
    };
  }
  if (p === "/galeri") {
    return {
      href: withBase("/panel?vf_tab=icerik&vf_sablon=galeri"),
      label: "Galeri şablonu",
    };
  }
  if (p === "/iletisim") {
    return {
      href: withBase("/panel?vf_tab=icerik&vf_sablon=iletisim"),
      label: "İletişim şablonu",
    };
  }
  if (p === "/qr-menu") {
    return {
      href: withBase("/panel?vf_tab=icerik&vf_sablon=qr_menu"),
      label: "QR menü",
    };
  }

  const cms = /^\/p\/([^/]+)$/.exec(p);
  if (cms?.[1]) {
    return {
      href: withBase(`/panel?vf_tab=icerik&vf_slug=${encodeURIComponent(cms[1])}`),
      label: "Bu ek sayfa",
    };
  }

  if (p === "/randevu" || p === "/randevular") {
    return {
      href: withBase("/panel?vf_tab=randevular"),
      label: "Randevular",
    };
  }

  return {
    href: withBase("/panel?vf_tab=icerik"),
    label: "İçerik",
  };
}

export function isPanelContentTab(s: string): s is PanelContentTab {
  return s === "home" || s === "hizmetler" || s === "galeri" || s === "iletisim" || s === "qr_menu";
}
