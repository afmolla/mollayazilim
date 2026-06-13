"use client";
import { useSitePrefix, useWithBase } from "@/components/SitePrefixProvider";


/**
 * Elementor benzeri akış: vitrinü düzenleme modunda yeni sekmede aç.
 * Kök panel (`/panel`) → kurumsal anasayfa; portföy panelleri → şablon sayfaları.
 */
export function PanelSiteVisualEdit() {
  const wb = useWithBase();
  const prefix = useSitePrefix();
  const isMaster = !prefix.trim();

  function openVisual(targetPath: string) {
    if (typeof window === "undefined") return;
    const u = new URL(wb(targetPath), window.location.origin);
    u.searchParams.set("vf_edit", "1");
    window.open(u.pathname + u.search + u.hash, "_blank", "noopener,noreferrer");
  }

  if (isMaster) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-[var(--text)]">Kurumsal site düzenle</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <strong className="font-medium text-[var(--text)]">mollayazilim.com</strong> ana vitrini burada
            yönetilir. Kuaför/restoran gibi demo vitrinlerin içeriği kendi panellerinden düzenlenir — bu panel
            yalnızca kurumsal siteye aittir.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--text)]">Kurumsal anasayfa</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Canlı siteyi yeni sekmede açın. Metin, SEO, iletişim ve demo görünürlüğü İçerik sekmesinden güncellenir.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openVisual("/")}
              className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--on-brand)]"
            >
              Anasayfayı aç (önizleme)
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--text)]">Panel sekmeleri</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <strong className="font-medium text-[var(--text)]">İçerik</strong> — tüm metinler, SEO, iletişim bilgileri,
              demo kart görünürlüğü
            </li>
            <li>
              <strong className="font-medium text-[var(--text)]">Portföy</strong> — demo vitrin adresleri ve panelleri
            </li>
            <li>
              <strong className="font-medium text-[var(--text)]">Ayarlar</strong> — panel şifresi
            </li>
            <li>
              <strong className="font-medium text-[var(--text)]">Lead&apos;ler</strong> — iletişim formu talepleri
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--muted)]">
          Demo vitrinler (kuaför, restoran, emlak vb.) için ilgili satırın{" "}
          <strong className="font-medium text-[var(--text)]">Paneli aç</strong> bağlantısını kullanın — örn.{" "}
          <strong className="font-medium text-[var(--text)]">/kuafor/panel</strong> yalnızca o vitrini düzenler.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text)]">Site düzenle (görsel)</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Panelde oturum açıkken vitrinü yeni sekmede açın; üstte turuncu çubuktan{" "}
          <strong className="font-medium text-[var(--text)]">«Bu sayfayı düzenle»</strong> ile doğrudan İçerik
          ekranına gidin. İçerik sekmesi ve şablon düzeni aynı kalır — buradan hızlı başlatırsınız.
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[var(--text)]">Vitrini aç</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Yeni sekmede açılır. Çubuk yalnızca panele giriş yaptıysanız görünür.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openVisual("/anasayfa")}
            className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--on-brand)]"
          >
            Anasayfa (düzenleme modu)
          </button>
          <button
            type="button"
            onClick={() => openVisual("/hizmetler")}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Hizmetler
          </button>
          <button
            type="button"
            onClick={() => openVisual("/galeri")}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Galeri
          </button>
          <button
            type="button"
            onClick={() => openVisual("/iletisim")}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            İletişim
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--muted)]">
        <p>
          Düzenleme modunda vitrin sayfalarında ve menüden açtığınız <strong className="font-medium text-[var(--text)]">/p/…</strong>{" "}
          sayfalarında metinlere <strong className="font-medium text-[var(--text)]">çift tıklayın</strong>; çoğu sayfada{" "}
          <strong className="font-medium text-[var(--text)]">sağ tık</strong> ile satır/görsel ekleme gibi kısayollar vardır.
          Gelişmiş blok düzeni <strong className="font-medium text-[var(--text)]">İçerik</strong> sekmesindedir.
        </p>
      </div>
    </div>
  );
}
