"use client";

import { useTheme } from "./ThemeProvider";
import type { ThemeId } from "@/lib/theme-constants";

const LABELS: Record<ThemeId, string> = {
  classic: "Klasik Berber",
  luxe: "Lüks Gece",
  minimal: "Minimal",
  nature: "Doğal",
};

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const ids = Object.keys(LABELS) as ThemeId[];

  if (compact) {
    return (
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <span className="sr-only">Tema</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeId)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text)]"
        >
          {ids.map((id) => (
            <option key={id} value={id}>
              {LABELS[id]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tema seçimi">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            theme === id
              ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-sm"
              : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]"
          }`}
        >
          {LABELS[id]}
        </button>
      ))}
    </div>
  );
}
