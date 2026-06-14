"use client";

import type { SiteIcerik } from "@/lib/content-store";
import { VARSAYILAN_FIYAT_HESAP } from "@/lib/fiyat-hesap-defaults";
import { VARSAYILAN_AMBALAJ_HOME } from "@/lib/ambalaj-home-defaults";

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2";

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[var(--text)]">{props.label}</span>
      <input className={`mt-1 ${inputCls}`} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </label>
  );
}

function Textarea(props: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[var(--text)]">{props.label}</span>
      <textarea
        rows={props.rows ?? 3}
        className={`mt-1 ${inputCls}`}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

export function PanelHomeExtrasFields(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
  onPickHeroKart?: () => void;
}) {
  const home = props.form.home;
  const kart = home.heroKart ?? { imageSrc: "", imageAlt: "", baslik: "", aciklama: "" };

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="font-semibold text-[var(--text)]">Hero etiketleri & yan kart</h3>
      <Textarea
        label="Etiket pill’leri (her satır bir etiket)"
        value={(home.etiketler ?? []).join("\n")}
        onChange={(v) =>
          props.setForm((s) => ({
            ...s!,
            home: { ...s!.home, etiketler: v.split("\n").map((x) => x.trim()).filter(Boolean) },
          }))
        }
      />
      <Textarea
        label="Güven şeridi (heroAltBloklar metin)"
        value={(home.heroAltBloklar ?? []).find((b) => b.tur === "metin")?.tur === "metin"
          ? ((home.heroAltBloklar ?? []).find((b) => b.tur === "metin") as { metin: string }).metin
          : ""}
        onChange={(v) =>
          props.setForm((s) => ({
            ...s!,
            home: {
              ...s!.home,
              heroAltBloklar: v.trim()
                ? [{ id: "trust", tur: "metin" as const, metin: v, hiza: "orta" as const }]
                : [],
            },
          }))
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Yan kart görsel URL"
          value={kart.imageSrc}
          onChange={(v) =>
            props.setForm((s) => ({
              ...s!,
              home: { ...s!.home, heroKart: { ...kart, imageSrc: v } },
            }))
          }
        />
        <Field
          label="Yan kart alt metin"
          value={kart.imageAlt}
          onChange={(v) =>
            props.setForm((s) => ({
              ...s!,
              home: { ...s!.home, heroKart: { ...kart, imageAlt: v } },
            }))
          }
        />
        <Field
          label="Yan kart başlık"
          value={kart.baslik}
          onChange={(v) =>
            props.setForm((s) => ({
              ...s!,
              home: { ...s!.home, heroKart: { ...kart, baslik: v } },
            }))
          }
        />
        <Field
          label="Yan kart açıklama"
          value={kart.aciklama}
          onChange={(v) =>
            props.setForm((s) => ({
              ...s!,
              home: { ...s!.home, heroKart: { ...kart, aciklama: v } },
            }))
          }
        />
      </div>
      {props.onPickHeroKart ? (
        <button
          type="button"
          onClick={props.onPickHeroKart}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
        >
          Medyadan yan kart görseli seç
        </button>
      ) : null}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--text)]">Öne çıkan kart görselleri</p>
        {home.features.map((f, i) => (
          <Field
            key={i}
            label={`${f.baslik || `Kart ${i + 1}`} — görsel URL`}
            value={f.imageSrc ?? ""}
            onChange={(v) =>
              props.setForm((s) => {
                const next = [...s!.home.features];
                next[i] = { ...next[i], imageSrc: v };
                return { ...s!, home: { ...s!.home, features: next } };
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

export function PanelRandevuFields(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
}) {
  const rf = props.form.randevuForm ?? {
    selectLabel: "Hizmet",
    options: [],
    pageTitle: "",
    pageDescription: "",
    submitButtonLabel: "",
    intro: "",
  };

  return (
    <div className="space-y-4">
      <Field
        label="Sayfa başlığı"
        value={rf.pageTitle ?? ""}
        onChange={(v) =>
          props.setForm((s) => ({ ...s!, randevuForm: { ...rf, pageTitle: v } }))
        }
      />
      <Textarea
        label="Sayfa açıklaması (SEO / üst metin)"
        value={rf.pageDescription ?? ""}
        onChange={(v) =>
          props.setForm((s) => ({ ...s!, randevuForm: { ...rf, pageDescription: v } }))
        }
      />
      <Textarea label="Form giriş metni" value={rf.intro ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, randevuForm: { ...rf, intro: v } }))} />
      <Field label="Select etiketi" value={rf.selectLabel} onChange={(v) => props.setForm((s) => ({ ...s!, randevuForm: { ...rf, selectLabel: v } }))} />
      <Field label="Gönder butonu" value={rf.submitButtonLabel ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, randevuForm: { ...rf, submitButtonLabel: v } }))} />
      <Textarea
        label="Seçenekler (her satır bir seçenek)"
        rows={8}
        value={(rf.options ?? []).join("\n")}
        onChange={(v) =>
          props.setForm((s) => ({
            ...s!,
            randevuForm: { ...rf, options: v.split("\n").map((x) => x.trim()).filter(Boolean) },
          }))
        }
      />
      <Field label="Onaylı liste başlığı" value={rf.approvedListTitle ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, randevuForm: { ...rf, approvedListTitle: v } }))} />
      <Textarea label="Onaylı liste açıklaması" value={rf.approvedListIntro ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, randevuForm: { ...rf, approvedListIntro: v } }))} />
    </div>
  );
}

export function PanelFiyatHesapFields(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
}) {
  const fh = { ...VARSAYILAN_FIYAT_HESAP, ...(props.form.fiyatHesap ?? {}) };
  const patch = (p: Partial<typeof fh>) =>
    props.setForm((s) => ({ ...s!, fiyatHesap: { ...fh, ...p } }));

  return (
    <div className="space-y-4">
      <Field label="SEO başlık" value={fh.seoTitle ?? ""} onChange={(v) => patch({ seoTitle: v })} />
      <Textarea label="SEO açıklama" value={fh.seoDescription ?? ""} onChange={(v) => patch({ seoDescription: v })} />
      <Field label="Üst rozet" value={fh.rozet} onChange={(v) => patch({ rozet: v })} />
      <Field label="Sayfa başlığı (H1)" value={fh.baslik} onChange={(v) => patch({ baslik: v })} />
      <Textarea label="Giriş paragrafı" value={fh.aciklama} onChange={(v) => patch({ aciklama: v })} />
      <Field label="Sonuç kutusu başlığı" value={fh.sonucBaslik} onChange={(v) => patch({ sonucBaslik: v })} />
      <Field label="WhatsApp butonu" value={fh.waButon} onChange={(v) => patch({ waButon: v })} />
      <Field label="Randevu / numune butonu" value={fh.randevuButon} onChange={(v) => patch({ randevuButon: v })} />
    </div>
  );
}

export function PanelAmbalajHomeFields(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
}) {
  const ah = { ...VARSAYILAN_AMBALAJ_HOME, ...(props.form.ambalajHome ?? {}) };
  const patch = (p: Partial<typeof ah>) =>
    props.setForm((s) => ({ ...s!, ambalajHome: { ...ah, ...p } }));

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="font-semibold text-[var(--text)]">Vitrin bölümleri (kategori grid, öne çıkanlar)</h3>
      <Field label="Promo şerit metni" value={ah.promoBar} onChange={(v) => patch({ promoBar: v })} />
      <Field label="Kategori bölüm başlığı" value={ah.kategoriBaslik} onChange={(v) => patch({ kategoriBaslik: v })} />
      <Textarea label="Kategori açıklaması" value={ah.kategoriAciklama} onChange={(v) => patch({ kategoriAciklama: v })} />
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--text)]">Kategori kartları</p>
        {ah.kategoriler.map((k, i) => (
          <div key={k.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Field
                label="Başlık"
                value={k.baslik}
                onChange={(v) => {
                  const kategoriler = [...ah.kategoriler];
                  kategoriler[i] = { ...kategoriler[i], baslik: v };
                  patch({ kategoriler });
                }}
              />
              <Field
                label="Alt başlık"
                value={k.altBaslik}
                onChange={(v) => {
                  const kategoriler = [...ah.kategoriler];
                  kategoriler[i] = { ...kategoriler[i], altBaslik: v };
                  patch({ kategoriler });
                }}
              />
              <Field
                label="Link (href)"
                value={k.href}
                onChange={(v) => {
                  const kategoriler = [...ah.kategoriler];
                  kategoriler[i] = { ...kategoriler[i], href: v };
                  patch({ kategoriler });
                }}
              />
              <Field
                label="Vurgu etiketi (opsiyonel)"
                value={k.vurgu ?? ""}
                onChange={(v) => {
                  const kategoriler = [...ah.kategoriler];
                  kategoriler[i] = { ...kategoriler[i], vurgu: v.trim() || undefined };
                  patch({ kategoriler });
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Field label="Öne çıkan bölüm başlığı" value={ah.oneCikanBaslik} onChange={(v) => patch({ oneCikanBaslik: v })} />
      <Textarea label="Öne çıkan açıklama" value={ah.oneCikanAciklama} onChange={(v) => patch({ oneCikanAciklama: v })} />
      <Field label="Güven bölümü başlığı" value={ah.guvenBaslik} onChange={(v) => patch({ guvenBaslik: v })} />
      <Field label="Sektör bölümü başlığı" value={ah.sektorBaslik} onChange={(v) => patch({ sektorBaslik: v })} />
      <Textarea label="Sektör açıklaması" value={ah.sektorAciklama} onChange={(v) => patch({ sektorAciklama: v })} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="CTA band başlık" value={ah.ctaBand.baslik} onChange={(v) => patch({ ctaBand: { ...ah.ctaBand, baslik: v } })} />
        <Field label="CTA birincil buton" value={ah.ctaBand.primaryLabel} onChange={(v) => patch({ ctaBand: { ...ah.ctaBand, primaryLabel: v } })} />
        <Field label="CTA birincil link" value={ah.ctaBand.primaryHref} onChange={(v) => patch({ ctaBand: { ...ah.ctaBand, primaryHref: v } })} />
        <Field label="CTA ikincil buton" value={ah.ctaBand.secondaryLabel} onChange={(v) => patch({ ctaBand: { ...ah.ctaBand, secondaryLabel: v } })} />
      </div>
      <Textarea label="CTA band açıklama" value={ah.ctaBand.aciklama} onChange={(v) => patch({ ctaBand: { ...ah.ctaBand, aciklama: v } })} />
    </div>
  );
}

export function PanelSiteFooterField(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
}) {
  return (
    <Field
      label="Footer ek metni (© satırı sonrası, boş bırakılabilir)"
      value={props.form.site?.footerEkMetin ?? ""}
      onChange={(v) =>
        props.setForm((s) => ({
          ...s!,
          site: { ...(s!.site ?? {}), footerEkMetin: v },
        }))
      }
    />
  );
}

export function PanelHizmetlerMetaFields(props: {
  form: SiteIcerik;
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>;
}) {
  const h = props.form.hizmetler;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Sayfa başlığı (H1)" value={h.sayfaBaslik ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, hizmetler: { ...h, sayfaBaslik: v } }))} />
      <Field label="1. kolon başlığı" value={h.kolonAd ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, hizmetler: { ...h, kolonAd: v } }))} />
      <Field label="2. kolon başlığı" value={h.kolonSure ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, hizmetler: { ...h, kolonSure: v } }))} />
      <Field label="3. kolon başlığı" value={h.kolonFiyat ?? ""} onChange={(v) => props.setForm((s) => ({ ...s!, hizmetler: { ...h, kolonFiyat: v } }))} />
    </div>
  );
}

export function PanelSayfaBaslikField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return <Field label={props.label} value={props.value} onChange={props.onChange} />;
}
