"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  acceptAllConsent,
  COOKIE_CATALOG,
  COOKIE_CONSENT_EVENT,
  necessaryOnlyConsent,
  readStoredConsent,
  writeStoredConsent,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";

type Ctx = {
  consent: CookieConsentChoice | null;
  ready: boolean;
  save: (choice: CookieConsentChoice) => void;
  openSettings: () => void;
};

const CookieConsentContext = createContext<Ctx | null>(null);

export function useCookieConsent(): Ctx {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    return {
      consent: null,
      ready: false,
      save: () => {},
      openSettings: () => {},
    };
  }
  return ctx;
}

export function hasAnalyticsConsent(consent: CookieConsentChoice | null): boolean {
  return consent?.analytics === true;
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${checked ? "bg-emerald-500" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? "left-[1.35rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SettingsModal({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: CookieConsentChoice;
  onChange: (c: CookieConsentChoice) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c14] p-5 text-white shadow-2xl sm:p-6">
        <h2 id="cookie-settings-title" className="text-lg font-semibold">
          Çerez tercihleri
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Hangi çerez kategorilerine izin verdiğinizi seçin. Detaylı bilgi için{" "}
          <Link href="/cerez-politikasi" className="underline hover:text-white" onClick={onClose}>
            çerez politikası
          </Link>
          .
        </p>

        <div className="mt-6 space-y-5">
          {COOKIE_CATALOG.map((cat) => {
            const on =
              cat.id === "necessary"
                ? true
                : cat.id === "analytics"
                  ? draft.analytics
                  : draft.functional;
            return (
              <div key={cat.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{cat.title}</p>
                    <p className="mt-1 text-xs text-white/65">{cat.description}</p>
                  </div>
                  <Toggle
                    label={cat.title}
                    checked={on}
                    disabled={cat.required}
                    onChange={(v) => {
                      if (cat.id === "analytics") onChange({ ...draft, analytics: v, updatedAt: Date.now() });
                      if (cat.id === "functional") onChange({ ...draft, functional: v, updatedAt: Date.now() });
                    }}
                  />
                </div>
                <ul className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs text-white/60">
                  {cat.cookies.map((c) => (
                    <li key={c.name}>
                      <span className="font-mono text-white/80">{c.name}</span>
                      <span className="text-white/50"> — {c.purpose}</span>
                      <span className="block text-white/40">Süre: {c.duration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<CookieConsentChoice>(necessaryOnlyConsent());

  const save = useCallback((choice: CookieConsentChoice) => {
    writeStoredConsent(choice);
    setConsent(choice);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  useEffect(() => {
    const stored = readStoredConsent();
    setConsent(stored);
    setShowBanner(!stored);
    setReady(true);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentChoice>).detail;
      if (detail) setConsent(detail);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onUpdate);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    const open = () => {
      setDraft(consent ?? necessaryOnlyConsent());
      setShowSettings(true);
    };
    window.addEventListener("molla-open-cookie-settings", open);
    return () => window.removeEventListener("molla-open-cookie-settings", open);
  }, [consent]);

  const openSettings = useCallback(() => {
    setDraft(consent ?? necessaryOnlyConsent());
    setShowSettings(true);
  }, [consent]);

  const value = useMemo(() => ({ consent, ready, save, openSettings }), [consent, ready, save, openSettings]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}

      {showBanner && ready ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#0a0a12]/95 p-4 shadow-2xl backdrop-blur-md sm:p-5"
          role="region"
          aria-label="Çerez bildirimi"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl text-sm text-white/85">
              <p className="font-semibold text-white">Çerez kullanımı</p>
              <p className="mt-1 leading-relaxed text-white/70">
                Sitemizde zorunlu çerezler her zaman kullanılır. Analitik ve işlevsel çerezler için onayınıza
                ihtiyaç duyarız.{" "}
                <Link href="/cerez-politikasi" className="underline hover:text-white">
                  Çerez politikası
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <button
                type="button"
                onClick={() => save(acceptAllConsent())}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                Tümünü kabul et
              </button>
              <button
                type="button"
                onClick={() => save(necessaryOnlyConsent())}
                className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sadece gerekli
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5"
              >
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSettings ? (
        <SettingsModal
          draft={draft}
          onChange={setDraft}
          onClose={() => setShowSettings(false)}
          onSave={() => save(draft)}
        />
      ) : null}
    </CookieConsentContext.Provider>
  );
}

/** Footer link — çerez ayarlarını açar */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("molla-open-cookie-settings"))}
    >
      Çerez ayarları
    </button>
  );
}
