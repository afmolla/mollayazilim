"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import {
  type ThemeId,
  THEME_STORAGE_KEY,
  isThemeId,
} from "@/lib/theme-constants";

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
} | null>(null);

function readThemeClient(): ThemeId {
  try {
    const dom = document.documentElement.getAttribute("data-theme");
    if (dom && isThemeId(dom)) return dom;
  } catch {
    /* ignore */
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isThemeId(stored)) return stored;
  } catch {
    /* gizli sekme / storage devre dışı */
  }
  return "classic";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /** Sunucu + ilk hidrasyon eşleşmesi; gerçek tema useLayoutEffect ile (inline script sonrası) */
  const [theme, setThemeState] = useState<ThemeId>("classic");

  useLayoutEffect(() => {
    const t = readThemeClient();
    /* Tema: inline script + storage — seçici ile UI eşleşmesi (dış kaynak) */
    queueMicrotask(() => {
      setThemeState(t);
      document.documentElement.dataset.theme = t;
    });
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = t;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme within ThemeProvider");
  return ctx;
}
