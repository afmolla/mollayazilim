export type ThemeId = "classic" | "luxe" | "minimal" | "nature";

export const THEME_STORAGE_KEY = "kuafor-theme";

export function isThemeId(v: string): v is ThemeId {
  return v === "classic" || v === "luxe" || v === "minimal" || v === "nature";
}

/** İlk boyamadan önce çalışır: gizli sekme / storage kapalıda bile güvenli varsayılan */
export function themeBootstrapInlineScript(): string {
  const key = THEME_STORAGE_KEY;
  return `!(function(){try{var k=${JSON.stringify(key)};var ok=/^(classic|luxe|minimal|nature)$/;var t=null;try{t=localStorage.getItem(k)}catch(e){}document.documentElement.setAttribute("data-theme",t&&ok.test(t)?t:"classic")}catch(e){document.documentElement.setAttribute("data-theme","classic")}})();`;
}
