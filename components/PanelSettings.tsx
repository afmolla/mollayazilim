"use client";
import { usePanelFetch, useSitePrefix, useWithBase } from "@/components/SitePrefixProvider";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SiteAyarlar = {
  salonAd: string;
  whatsapp: string;
  iletisimWhatsapp?: string;
  iletisimTelefon?: string;
  iletisimEposta?: string;
  adresKisa: string;
  adresDetay: string;
  calismaSaatleri: string;
  sehir: string;
  menuDavranis?: "hover" | "sabit";
  panelSolMenuSabitle?: boolean;
  panelSolMenuBaslangic?: "acik" | "dar";
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  googleMaps?: string;
  footerSosyalGoster?: boolean;
  mobilSiparisAcik?: boolean;
  mobilMinVersiyon?: string;
  mobilIosIndirUrl?: string;
  mobilAndroidIndirUrl?: string;
  mobilAndroidApkUrl?: string;
};

export function PanelSettings() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const sitePrefix = useSitePrefix();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErr, setPasswordErr] = useState("");
  const [passwordOk, setPasswordOk] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [form, setForm] = useState<SiteAyarlar>({
    salonAd: "",
    whatsapp: "",
    iletisimWhatsapp: "",
    iletisimTelefon: "",
    iletisimEposta: "",
    adresKisa: "",
    adresDetay: "",
    calismaSaatleri: "",
    sehir: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
    googleMaps: "",
    footerSosyalGoster: true,
    mobilSiparisAcik: false,
    mobilMinVersiyon: "",
    mobilIosIndirUrl: "",
    mobilAndroidIndirUrl: "",
    mobilAndroidApkUrl: "",
    panelSolMenuSabitle: true,
    panelSolMenuBaslangic: "acik",
  });

  useEffect(() => {
    (async () => {
      const res = await panelFetch(wb("/api/panel/settings"), { cache: "no-store" });
      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Ayarlar yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { ayarlar: SiteAyarlar };
      setForm({
        ...j.ayarlar,
        menuDavranis: j.ayarlar.menuDavranis ?? "hover",
        panelSolMenuSabitle: j.ayarlar.panelSolMenuSabitle ?? true,
        panelSolMenuBaslangic: j.ayarlar.panelSolMenuBaslangic ?? "acik",
        iletisimWhatsapp: j.ayarlar.iletisimWhatsapp ?? "",
        iletisimTelefon: j.ayarlar.iletisimTelefon ?? "",
        iletisimEposta: j.ayarlar.iletisimEposta ?? "",
        instagram: j.ayarlar.instagram ?? "",
        facebook: j.ayarlar.facebook ?? "",
        twitter: j.ayarlar.twitter ?? "",
        youtube: j.ayarlar.youtube ?? "",
        tiktok: j.ayarlar.tiktok ?? "",
        linkedin: j.ayarlar.linkedin ?? "",
        googleMaps: j.ayarlar.googleMaps ?? "",
        footerSosyalGoster: j.ayarlar.footerSosyalGoster ?? true,
        mobilSiparisAcik: j.ayarlar.mobilSiparisAcik ?? false,
        mobilMinVersiyon: j.ayarlar.mobilMinVersiyon ?? "",
        mobilIosIndirUrl: j.ayarlar.mobilIosIndirUrl ?? "",
        mobilAndroidIndirUrl: j.ayarlar.mobilAndroidIndirUrl ?? "",
        mobilAndroidApkUrl: j.ayarlar.mobilAndroidApkUrl ?? "",
      });
      setErr("");
      setLoading(false);
    })().catch(() => {
      setErr("Ayarlar yüklenemedi");
      setLoading(false);
    });
  }, [router, wb, panelFetch]);

  async function save() {
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await panelFetch(wb("/api/panel/settings"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      setOkMsg("Kaydedildi.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPasswordSaving(true);
    setPasswordErr("");
    setPasswordOk("");
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordErr("Yeni şifre tekrarı eşleşmiyor");
        return;
      }
      const res = await panelFetch(wb("/api/panel/password"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setPasswordErr(j.error ?? "Şifre değiştirilemedi");
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOk("Şifre güncellendi. Sonraki girişte yeni şifre geçerli olacak.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Site ayarları</h1>
        <p className="text-sm text-[var(--muted)]">Header/footer, SEO ve iletişim bilgileri burada yönetilir.</p>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          {okMsg}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Genel</h2>
          <div className="mt-4 space-y-4">
            <Field label="Salon adı" value={form.salonAd} onChange={(v) => setForm((s) => ({ ...s, salonAd: v }))} />
            <Field label="Şehir" value={form.sehir} onChange={(v) => setForm((s) => ({ ...s, sehir: v }))} />
            <Field
              label="WhatsApp (9055...)"
              value={form.whatsapp}
              onChange={(v) => setForm((s) => ({ ...s, whatsapp: v }))}
            />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">İletişim (kurumsal)</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Bu alanlar vitrin/kurumsal sayfalarda (örn. Molla footer + teklif formu) kullanılır.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field
                  label="İletişim WhatsApp (9055...)"
                  value={form.iletisimWhatsapp ?? ""}
                  onChange={(v) => setForm((s) => ({ ...s, iletisimWhatsapp: v }))}
                />
                <Field
                  label="Telefon (+90 ...)"
                  value={form.iletisimTelefon ?? ""}
                  onChange={(v) => setForm((s) => ({ ...s, iletisimTelefon: v }))}
                />
                <Field
                  label="E‑posta"
                  value={form.iletisimEposta ?? ""}
                  onChange={(v) => setForm((s) => ({ ...s, iletisimEposta: v }))}
                />
              </div>
            </div>
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)]">
              Vitrinde menü bağlantıları üst çubukta <strong className="text-[var(--text)]">ortada</strong> görünür.
              Sol açılır menü yalnızca <strong className="text-[var(--text)]">yönetim panelinde</strong> (/panel).
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Adres ve saatler</h2>
          <div className="mt-4 space-y-4">
            <Field
              label="Adres kısa"
              value={form.adresKisa}
              onChange={(v) => setForm((s) => ({ ...s, adresKisa: v }))}
            />
            <Field
              label="Adres detay"
              value={form.adresDetay}
              onChange={(v) => setForm((s) => ({ ...s, adresDetay: v }))}
            />
            <Field
              label="Çalışma saatleri"
              value={form.calismaSaatleri}
              onChange={(v) => setForm((s) => ({ ...s, calismaSaatleri: v }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Panel şifresi</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Mevcut şifre doğruysa yeni şifre kaydedilir. Varsayılan şifre: <code className="rounded bg-[var(--surface-2)] px-1">demo123</code>.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <PasswordField
              label="Mevcut şifre"
              value={passwordForm.currentPassword}
              autoComplete="current-password"
              onChange={(v) => setPasswordForm((s) => ({ ...s, currentPassword: v }))}
            />
            <PasswordField
              label="Yeni şifre"
              value={passwordForm.newPassword}
              autoComplete="new-password"
              onChange={(v) => setPasswordForm((s) => ({ ...s, newPassword: v }))}
            />
            <PasswordField
              label="Yeni şifre tekrar"
              value={passwordForm.confirmPassword}
              autoComplete="new-password"
              onChange={(v) => setPasswordForm((s) => ({ ...s, confirmPassword: v }))}
            />
          </div>
          {passwordErr ? (
            <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
              {passwordErr}
            </p>
          ) : null}
          {passwordOk ? (
            <p className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">
              {passwordOk}
            </p>
          ) : null}
          <button
            type="button"
            disabled={passwordSaving}
            onClick={() => void changePassword()}
            className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-2 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
          >
            {passwordSaving ? "Şifre kaydediliyor…" : "Şifreyi değiştir"}
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Yönetim paneli (sol menü)</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ‹ › ile anında daraltıp açarsınız (tarayıcıda hatırlanır). Aşağıdakiler tüm cihazlarda geçerli site ayarıdır.
          </p>
          <div className="mt-4 space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.panelSolMenuSabitle ?? true}
                onChange={(e) => setForm((s) => ({ ...s, panelSolMenuSabitle: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-[var(--text)]">Sol menüyü sabitle</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  Açıkken menü kaydırırken ekranda kalır; kapalıysa uzun sayfada menü sayfa ile birlikte kayar.
                </span>
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium text-[var(--text)]">İlk açılış (dar / geniş)</label>
              <select
                value={form.panelSolMenuBaslangic ?? "acik"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    panelSolMenuBaslangic: e.target.value as "acik" | "dar",
                  }))
                }
                className="mt-1 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
              >
                <option value="acik">Geniş (etiketler görünsün)</option>
                <option value="dar">Dar (kısaltmalar — yerel tercih yoksa)</option>
              </select>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Bu bilgisayarda daha önce ‹ › ile seçim yaptıysanız tarayıcı onu önceliklendirir; tercihi sıfırlamak için site verilerini temizleyin.
              </p>
            </div>
          </div>
        </div>

        {sitePrefix.replace(/\/+$/, "") === "/restaurant" ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-[var(--text)]">Mobil sipariş</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Kapalıyken mobil uygulama menüyü okuyamaz ve sipariş oluşturamaz. Menü içeriği için{" "}
              <strong className="font-medium text-[var(--text)]">İçerik → QR menü</strong> veya ilgili panel ekranını kullanın.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.mobilSiparisAcik ?? false}
                onChange={(e) => setForm((s) => ({ ...s, mobilSiparisAcik: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-[var(--text)]">Mobil siparişi aç</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  API: <code className="rounded bg-[var(--surface)] px-1">GET /api/public/menu</code>,{" "}
                  <code className="rounded bg-[var(--surface)] px-1">POST /api/public/order</code> — istekte{" "}
                  <code className="rounded bg-[var(--surface)] px-1">x-site-prefix: /restaurant</code> ve{" "}
                  <code className="rounded bg-[var(--surface)] px-1">x-data-subdir: restaurant</code> gönderilir.
                </span>
              </span>
            </label>
            <div className="mt-4">
              <Field
                label="Zorunlu minimum uygulama sürümü (örn. 1.0.0)"
                value={form.mobilMinVersiyon ?? ""}
                onChange={(v) => setForm((s) => ({ ...s, mobilMinVersiyon: v }))}
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Doldurduğunuzda, bu sürümden düşük mobil uygulamalar menü ve sipariş alamaz; kullanıcı güncelleme ekranı görür.
                Boş bırakırsanız sürüm zorunluluğu yok. Uygulama sürümü <code className="rounded bg-[var(--surface-2)] px-1">x-app-version</code> başlığı ile gider.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="App Store indirme linki (iPhone)"
                value={form.mobilIosIndirUrl ?? ""}
                onChange={(v) => setForm((s) => ({ ...s, mobilIosIndirUrl: v }))}
              />
              <Field
                label="Google Play indirme linki (Android)"
                value={form.mobilAndroidIndirUrl ?? ""}
                onChange={(v) => setForm((s) => ({ ...s, mobilAndroidIndirUrl: v }))}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Android APK (doğrudan indir)"
                value={form.mobilAndroidApkUrl ?? ""}
                onChange={(v) => setForm((s) => ({ ...s, mobilAndroidApkUrl: v }))}
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Site kökündeki dosya için örnek: <code className="rounded bg-[var(--surface-2)] px-1">/apk/molla-restaurant.apk</code> — dosyayı sunucuda{" "}
                <code className="rounded bg-[var(--surface-2)] px-1">public/apk/</code> altına koyun. Tam harici URL de verebilirsiniz.
              </p>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Mağaza linkleri için tam URL yapıştırın (https://…). APK yalnızca Android&apos;te kurulur; iPhone için App Store linki kullanın.
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Sosyal / Harita</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Bu alanlar sitede sayfanın <strong className="font-medium text-[var(--text)]">en altında</strong>, telif satırının hemen
            üzerinde gösterilir. Boş bıraktıklarınız görünmez.
          </p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.footerSosyalGoster ?? true}
              onChange={(e) => setForm((s) => ({ ...s, footerSosyalGoster: e.target.checked }))}
            />
            <span>
              <span className="font-medium text-[var(--text)]">Footer sosyal alanını göster</span>
              <span className="mt-1 block text-sm text-[var(--muted)]">
                Kapalıysa altta sosyal medya/harita bölümü hiç görünmez.
              </span>
            </span>
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field
              label="Instagram URL"
              value={form.instagram ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, instagram: v }))}
            />
            <Field
              label="Facebook URL"
              value={form.facebook ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, facebook: v }))}
            />
            <Field
              label="X / Twitter URL"
              value={form.twitter ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, twitter: v }))}
            />
            <Field
              label="YouTube URL"
              value={form.youtube ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, youtube: v }))}
            />
            <Field
              label="TikTok URL"
              value={form.tiktok ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, tiktok: v }))}
            />
            <Field
              label="LinkedIn URL"
              value={form.linkedin ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, linkedin: v }))}
            />
            <Field
              label="Google Maps URL"
              value={form.googleMaps ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, googleMaps: v }))}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] disabled:opacity-60"
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
      />
    </div>
  );
}

function PasswordField(props: {
  label: string;
  value: string;
  autoComplete: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      <input
        type="password"
        value={props.value}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
      />
    </div>
  );
}
