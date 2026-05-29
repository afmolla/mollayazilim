/** Çerez tercihi — localStorage (KVKK bilgilendirme) */
export const COOKIE_CONSENT_KEY = "molla_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "molla-cookie-consent-updated";

export type CookieConsentChoice = {
  /** Zorunlu — her zaman true */
  necessary: true;
  /** Google Analytics, ziyaret istatistiği (vf_vid) */
  analytics: boolean;
  /** Tema tercihi vb. */
  functional: boolean;
  updatedAt: number;
};

export type CookieCategoryId = "necessary" | "analytics" | "functional";

export type CookieCatalogItem = {
  id: CookieCategoryId;
  title: string;
  description: string;
  required: boolean;
  cookies: { name: string; purpose: string; duration: string }[];
};

export const COOKIE_CATALOG: CookieCatalogItem[] = [
  {
    id: "necessary",
    title: "Zorunlu çerezler",
    description:
      "Sitenin güvenli çalışması, oturum yönetimi (panel girişi) ve çerez tercihinizin hatırlanması için gereklidir. Kapatılamaz.",
    required: true,
    cookies: [
      {
        name: "panel_session_*",
        purpose: "Yönetim paneli oturumu (httpOnly, giriş yaptıysanız)",
        duration: "Oturum / 7 gün",
      },
      {
        name: "molla_cookie_consent_v1",
        purpose: "Çerez tercihlerinizi saklar (localStorage)",
        duration: "1 yıl",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analitik çerezler",
    description:
      "Ziyaret sayısı, hangi sayfaların görüntülendiği gibi anonim istatistikler. Google Analytics yapılandırıldıysa üçüncü taraf çerezler de kullanılabilir.",
    required: false,
    cookies: [
      {
        name: "vf_vid",
        purpose: "Tekil ziyaretçi istatistiği (site içi analiz)",
        duration: "1 yıl",
      },
      {
        name: "_ga, _ga_*",
        purpose: "Google Analytics 4 (yalnızca env ile etkinse)",
        duration: "2 yıl",
      },
    ],
  },
  {
    id: "functional",
    title: "İşlevsel tercihler",
    description: "Tema seçimi ve arayüz tercihlerinizi hatırlar. Zorunlu değildir.",
    required: false,
    cookies: [
      {
        name: "vf-theme",
        purpose: "Vitrin tema rengi (localStorage)",
        duration: "Kalıcı",
      },
      {
        name: "vf_panel_nav_collapsed",
        purpose: "Panel sol menü dar/geniş tercihi",
        duration: "Kalıcı",
      },
    ],
  },
];

export function defaultConsent(overrides?: Partial<Pick<CookieConsentChoice, "analytics" | "functional">>): CookieConsentChoice {
  return {
    necessary: true,
    analytics: overrides?.analytics ?? false,
    functional: overrides?.functional ?? false,
    updatedAt: Date.now(),
  };
}

export function acceptAllConsent(): CookieConsentChoice {
  return defaultConsent({ analytics: true, functional: true });
}

export function necessaryOnlyConsent(): CookieConsentChoice {
  return defaultConsent({ analytics: false, functional: false });
}

export function readStoredConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CookieConsentChoice;
    if (p.necessary !== true) return null;
    return {
      necessary: true,
      analytics: !!p.analytics,
      functional: !!p.functional,
      updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeStoredConsent(choice: CookieConsentChoice): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(choice));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
}
