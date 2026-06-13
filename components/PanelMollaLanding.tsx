"use client";

import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  MollaDemoGroup,
  MollaDemoItem,
  MollaFaqItem,
  MollaLanding,
  MollaLandingFeature,
  MollaNavLink,
  MollaPackage,
  MollaProcessStep,
  MollaSectionMeta,
} from "@/lib/molla-landing-store";

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "crm", label: "CRM" },
  { id: "hizmetler", label: "Web hizmetleri" },
  { id: "demolar", label: "Demolar" },
  { id: "paketler", label: "Paketler" },
  { id: "surec", label: "Süreç" },
  { id: "sss", label: "SSS" },
  { id: "iletisim", label: "İletişim" },
  { id: "navbar", label: "Menü & bar" },
  { id: "footer", label: "Footer" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Field(props: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${props.className ?? ""}`}>
      <span className="font-medium text-[var(--text)]">{props.label}</span>
      <div className="mt-1">{props.children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm";

function SectionMetaFields(props: {
  value: MollaSectionMeta;
  onChange: (v: MollaSectionMeta) => void;
}) {
  const v = props.value;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Üst satır">
        <input className={inputCls} value={v.overline} onChange={(e) => props.onChange({ ...v, overline: e.target.value })} />
      </Field>
      <Field label="Başlık">
        <input className={inputCls} value={v.baslik} onChange={(e) => props.onChange({ ...v, baslik: e.target.value })} />
      </Field>
      <Field label="Açıklama" className="md:col-span-2">
        <textarea rows={3} className={inputCls} value={v.aciklama} onChange={(e) => props.onChange({ ...v, aciklama: e.target.value })} />
      </Field>
    </div>
  );
}

function FeatureListEditor(props: {
  items: MollaLandingFeature[];
  onChange: (items: MollaLandingFeature[]) => void;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[var(--text)]">{props.label ?? "Özellik kartları"}</p>
      {props.items.map((f, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 md:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Başlık"
            value={f.title}
            onChange={(e) => {
              const next = [...props.items];
              next[i] = { ...f, title: e.target.value };
              props.onChange(next);
            }}
          />
          <input
            className={inputCls}
            placeholder="Açıklama"
            value={f.desc}
            onChange={(e) => {
              const next = [...props.items];
              next[i] = { ...f, desc: e.target.value };
              props.onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-xs font-medium text-[var(--brand)]"
        onClick={() => props.onChange([...props.items, { title: "Yeni", desc: "" }])}
      >
        + Kart ekle
      </button>
    </div>
  );
}

function LinesEditor(props: { label: string; lines: string[]; onChange: (lines: string[]) => void }) {
  return (
    <Field label={props.label}>
      <textarea
        rows={Math.max(3, props.lines.length + 1)}
        className={inputCls}
        value={props.lines.join("\n")}
        onChange={(e) => props.onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
      />
      <p className="mt-1 text-xs text-[var(--muted)]">Her satır bir madde</p>
    </Field>
  );
}

export function PanelMollaLanding() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [form, setForm] = useState<MollaLanding | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await panelFetch(wb("/api/panel/landing"), { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Kurumsal içerik yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { landing: MollaLanding };
      setForm(j.landing);
      setLoading(false);
    })();
  }, [panelFetch, router, wb]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await panelFetch(wb("/api/panel/landing"), {
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
      setOkMsg("Kaydedildi — anasayfayı yenileyin.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-[var(--muted)]">Kurumsal içerik yükleniyor…</p>;
  }

  const h = form.hero;
  const crm = form.crmBolum;
  const hz = form.hizmetlerBolum;
  const dm = form.demolarBolum;
  const pk = form.paketlerBolum;
  const sr = form.surecBolum;
  const sss = form.sssBolum;
  const il = form.iletisimBolum;

  function patchForm(fn: (prev: MollaLanding) => MollaLanding) {
    setForm((prev) => (prev ? fn(prev) : prev));
  }

  function updateDemoGroup(gi: number, patch: Partial<MollaDemoGroup>) {
    patchForm((prev) => {
      const d = prev.demolarBolum;
      const gruplar = [...d.gruplar];
      gruplar[gi] = { ...gruplar[gi], ...patch };
      return { ...prev, demolarBolum: { ...d, gruplar } };
    });
  }

  function updateDemoItem(gi: number, ii: number, patch: Partial<MollaDemoItem>) {
    patchForm((prev) => {
      const d = prev.demolarBolum;
      const gruplar = [...d.gruplar];
      const items = [...gruplar[gi].items];
      items[ii] = { ...items[ii], ...patch };
      gruplar[gi] = { ...gruplar[gi], items };
      return { ...prev, demolarBolum: { ...d, gruplar } };
    });
  }

  function updatePackage(i: number, patch: Partial<MollaPackage>) {
    patchForm((prev) => {
      const p = prev.paketlerBolum;
      const paketler = [...p.paketler];
      paketler[i] = { ...paketler[i], ...patch };
      return { ...prev, paketlerBolum: { ...p, paketler } };
    });
  }

  function updateFaq(i: number, patch: Partial<MollaFaqItem>) {
    patchForm((prev) => {
      const s = prev.sssBolum;
      const sorular = [...s.sorular];
      sorular[i] = { ...sorular[i], ...patch };
      return { ...prev, sssBolum: { ...s, sorular } };
    });
  }

  function updateStep(i: number, patch: Partial<MollaProcessStep>) {
    patchForm((prev) => {
      const s = prev.surecBolum;
      const adimlar = [...s.adimlar];
      adimlar[i] = { ...adimlar[i], ...patch };
      return { ...prev, surecBolum: { ...s, adimlar } };
    });
  }

  function updateNavLink(i: number, patch: Partial<MollaNavLink>) {
    patchForm((prev) => {
      const navLinks = [...prev.navbar.navLinks];
      navLinks[i] = { ...navLinks[i], ...patch };
      return { ...prev, navbar: { ...prev.navbar, navLinks } };
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text)]">Kurumsal anasayfa</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          mollayazilim.com tüm metinleri buradan düzenlenir. SEO → <strong>SEO</strong>, iletişim bilgileri →{" "}
          <strong>Ayarlar</strong>, demo kart görünürlüğü → <strong>Portföy</strong>.
        </p>
      </header>

      {err ? <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600">{err}</p> : null}
      {okMsg ? <p className="rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-700">{okMsg}</p> : null}

      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              tab === t.id ? "bg-[var(--brand)] text-[var(--on-brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        {tab === "hero" ? (
          <div className="space-y-4">
            <Field label="Üst etiket (pill)">
              <input className={inputCls} value={h.pill} onChange={(e) => setForm({ ...form, hero: { ...h, pill: e.target.value } })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Başlık">
                <input className={inputCls} value={h.baslik} onChange={(e) => setForm({ ...form, hero: { ...h, baslik: e.target.value } })} />
              </Field>
              <Field label="Başlık vurgu">
                <input className={inputCls} value={h.baslikVurgu} onChange={(e) => setForm({ ...form, hero: { ...h, baslikVurgu: e.target.value } })} />
              </Field>
            </div>
            <Field label="Açıklama">
              <textarea rows={4} className={inputCls} value={h.aciklama} onChange={(e) => setForm({ ...form, hero: { ...h, aciklama: e.target.value } })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Birincil buton">
                <input className={inputCls} value={h.ctaPrimaryLabel} onChange={(e) => setForm({ ...form, hero: { ...h, ctaPrimaryLabel: e.target.value } })} />
              </Field>
              <Field label="Birincil link">
                <input className={inputCls} value={h.ctaPrimaryHref} onChange={(e) => setForm({ ...form, hero: { ...h, ctaPrimaryHref: e.target.value } })} />
              </Field>
              <Field label="İkincil buton">
                <input className={inputCls} value={h.ctaSecondaryLabel} onChange={(e) => setForm({ ...form, hero: { ...h, ctaSecondaryLabel: e.target.value } })} />
              </Field>
              <Field label="İkincil link">
                <input className={inputCls} value={h.ctaSecondaryHref} onChange={(e) => setForm({ ...form, hero: { ...h, ctaSecondaryHref: e.target.value } })} />
              </Field>
            </div>
            <FeatureListEditor items={h.features} onChange={(features) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, features } }))} label="Hero özellik kartları" />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--text)]">İstatistikler</p>
              {h.stats.map((st, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 md:grid-cols-2">
                  <input
                    className={inputCls}
                    placeholder="Değer"
                    value={st.value}
                    onChange={(e) =>
                      patchForm((prev) => {
                        const stats = [...prev.hero.stats];
                        stats[i] = { ...stats[i], value: e.target.value };
                        return { ...prev, hero: { ...prev.hero, stats } };
                      })
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder="Etiket"
                    value={st.label}
                    onChange={(e) =>
                      patchForm((prev) => {
                        const stats = [...prev.hero.stats];
                        stats[i] = { ...stats[i], label: e.target.value };
                        return { ...prev, hero: { ...prev.hero, stats } };
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <Field label="Önizleme başlık">
              <input className={inputCls} value={h.previewBaslik} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewBaslik: e.target.value } }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Önizleme alt başlık">
                <input className={inputCls} value={h.previewAltBaslik} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewAltBaslik: e.target.value } }))} />
              </Field>
              <Field label="Önizleme açıklama">
                <input className={inputCls} value={h.previewAciklama} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewAciklama: e.target.value } }))} />
              </Field>
            </div>
            <LinesEditor label="Önizleme liste maddeleri" lines={h.previewItems} onChange={(previewItems) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewItems } }))} />
            <Field label="Önizleme görsel URL">
              <input className={inputCls} value={h.previewGorselUrl} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewGorselUrl: e.target.value } }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Görsel alt metni">
                <input className={inputCls} value={h.previewGorselAlt} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewGorselAlt: e.target.value } }))} />
              </Field>
              <Field label="Görsel üst yazı">
                <input className={inputCls} value={h.previewGorselCaption} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewGorselCaption: e.target.value } }))} />
              </Field>
              <Field label="Görsel alt yazı">
                <input className={inputCls} value={h.previewGorselAltBaslik} onChange={(e) => patchForm((prev) => ({ ...prev, hero: { ...prev.hero, previewGorselAltBaslik: e.target.value } }))} />
              </Field>
            </div>
          </div>
        ) : null}

        {tab === "crm" ? (
          <div className="space-y-4">
            <SectionMetaFields value={crm} onChange={(v) => setForm({ ...form, crmBolum: { ...crm, ...v } })} />
            <FeatureListEditor items={crm.ozellikler} onChange={(ozellikler) => setForm({ ...form, crmBolum: { ...crm, ozellikler } })} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CTA birincil">
                <input className={inputCls} value={crm.ctaPrimaryLabel} onChange={(e) => setForm({ ...form, crmBolum: { ...crm, ctaPrimaryLabel: e.target.value } })} />
              </Field>
              <Field label="CTA birincil link">
                <input className={inputCls} value={crm.ctaPrimaryHref} onChange={(e) => setForm({ ...form, crmBolum: { ...crm, ctaPrimaryHref: e.target.value } })} />
              </Field>
              <Field label="CTA ikincil">
                <input className={inputCls} value={crm.ctaSecondaryLabel} onChange={(e) => patchForm((prev) => ({ ...prev, crmBolum: { ...prev.crmBolum, ctaSecondaryLabel: e.target.value } }))} />
              </Field>
              <Field label="CTA ikincil link">
                <input className={inputCls} value={crm.ctaSecondaryHref} onChange={(e) => patchForm((prev) => ({ ...prev, crmBolum: { ...prev.crmBolum, ctaSecondaryHref: e.target.value } }))} />
              </Field>
              <Field label="Demo giriş notu">
                <input className={inputCls} value={crm.demoGirisNotu} onChange={(e) => setForm({ ...form, crmBolum: { ...crm, demoGirisNotu: e.target.value } })} />
              </Field>
            </div>
          </div>
        ) : null}

        {tab === "hizmetler" ? (
          <div className="space-y-4">
            <SectionMetaFields value={hz} onChange={(v) => setForm({ ...form, hizmetlerBolum: { ...hz, ...v } })} />
            <FeatureListEditor items={hz.kartlar} onChange={(kartlar) => setForm({ ...form, hizmetlerBolum: { ...hz, kartlar } })} />
            <LinesEditor label="Kart rozetleri" lines={hz.rozetler} onChange={(rozetler) => setForm({ ...form, hizmetlerBolum: { ...hz, rozetler } })} />
          </div>
        ) : null}

        {tab === "demolar" ? (
          <div className="space-y-6">
            <SectionMetaFields value={dm} onChange={(v) => setForm({ ...form, demolarBolum: { ...dm, ...v } })} />
            <Field label="Tüm demolar kapalı mesajı">
              <textarea rows={2} className={inputCls} value={dm.bosMesaj} onChange={(e) => setForm({ ...form, demolarBolum: { ...dm, bosMesaj: e.target.value } })} />
            </Field>
            {dm.gruplar.map((g, gi) => (
              <div key={g.id} className="space-y-3 rounded-xl border border-dashed border-[var(--border)] p-4">
                <Field label={`Grup: ${g.id}`}>
                  <input className={inputCls} value={g.title} onChange={(e) => updateDemoGroup(gi, { title: e.target.value })} />
                </Field>
                <Field label="Grup açıklama">
                  <textarea rows={2} className={inputCls} value={g.desc} onChange={(e) => updateDemoGroup(gi, { desc: e.target.value })} />
                </Field>
                {g.items.map((item, ii) => (
                  <div key={item.key} className="grid gap-2 rounded-lg bg-[var(--surface-2)] p-3 md:grid-cols-2">
                    <input className={inputCls} value={item.title} placeholder="Başlık" onChange={(e) => updateDemoItem(gi, ii, { title: e.target.value })} />
                    <input className={inputCls} value={item.meta} placeholder="Açıklama" onChange={(e) => updateDemoItem(gi, ii, { meta: e.target.value })} />
                    <input className={inputCls} value={item.href} placeholder="Link" onChange={(e) => updateDemoItem(gi, ii, { href: e.target.value })} />
                    <input className={inputCls} value={item.primaryLabel ?? ""} placeholder="Birincil buton" onChange={(e) => updateDemoItem(gi, ii, { primaryLabel: e.target.value })} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {tab === "paketler" ? (
          <div className="space-y-4">
            <SectionMetaFields value={pk} onChange={(v) => setForm({ ...form, paketlerBolum: { ...pk, ...v } })} />
            {pk.paketler.map((p, i) => (
              <div key={p.title} className="space-y-2 rounded-xl border border-[var(--border)] p-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <input className={inputCls} value={p.title} placeholder="Paket adı" onChange={(e) => updatePackage(i, { title: e.target.value })} />
                  <input className={inputCls} value={p.badge} placeholder="Rozet" onChange={(e) => updatePackage(i, { badge: e.target.value })} />
                </div>
                <textarea rows={2} className={inputCls} value={p.desc} onChange={(e) => updatePackage(i, { desc: e.target.value })} />
                <LinesEditor label="Madde listesi" lines={p.items} onChange={(items) => updatePackage(i, { items })} />
                <div className="grid gap-2 md:grid-cols-2">
                  <input className={inputCls} value={p.cta} placeholder="Buton metni" onChange={(e) => updatePackage(i, { cta: e.target.value })} />
                  <input className={inputCls} value={p.href} placeholder="Link (#crm)" onChange={(e) => updatePackage(i, { href: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "surec" ? (
          <div className="space-y-4">
            <SectionMetaFields value={sr} onChange={(v) => setForm({ ...form, surecBolum: { ...sr, ...v } })} />
            {sr.adimlar.map((s, i) => (
              <div key={s.no} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 md:grid-cols-3">
                <input className={inputCls} value={s.no} onChange={(e) => updateStep(i, { no: e.target.value })} />
                <input className={inputCls} value={s.baslik} onChange={(e) => updateStep(i, { baslik: e.target.value })} />
                <input className={inputCls} value={s.aciklama} onChange={(e) => updateStep(i, { aciklama: e.target.value })} />
              </div>
            ))}
            <Field label="Taahhüt başlık">
              <input className={inputCls} value={sr.taahhutBaslik} onChange={(e) => setForm({ ...form, surecBolum: { ...sr, taahhutBaslik: e.target.value } })} />
            </Field>
            <Field label="Taahhüt metin">
              <textarea rows={3} className={inputCls} value={sr.taahhutMetin} onChange={(e) => setForm({ ...form, surecBolum: { ...sr, taahhutMetin: e.target.value } })} />
            </Field>
          </div>
        ) : null}

        {tab === "sss" ? (
          <div className="space-y-4">
            <SectionMetaFields value={sss} onChange={(v) => setForm({ ...form, sssBolum: { ...sss, ...v } })} />
            {sss.sorular.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                <input className={inputCls} value={f.q} placeholder="Soru" onChange={(e) => updateFaq(i, { q: e.target.value })} />
                <textarea rows={3} className={inputCls} value={f.a} placeholder="Cevap" onChange={(e) => updateFaq(i, { a: e.target.value })} />
              </div>
            ))}
            <button type="button" className="text-xs font-medium text-[var(--brand)]" onClick={() => setForm({ ...form, sssBolum: { ...sss, sorular: [...sss.sorular, { q: "Yeni soru", a: "" }] } })}>
              + Soru ekle
            </button>
          </div>
        ) : null}

        {tab === "iletisim" ? (
          <div className="space-y-4">
            <SectionMetaFields value={il} onChange={(v) => setForm({ ...form, iletisimBolum: { ...il, ...v } })} />
            <Field label="Vurgu kutusu">
              <textarea rows={3} className={inputCls} value={il.vurguMetin} onChange={(e) => patchForm((prev) => ({ ...prev, iletisimBolum: { ...prev.iletisimBolum, vurguMetin: e.target.value } }))} />
            </Field>
            <Field label="Hızlı bilgi başlık">
              <input className={inputCls} value={il.hizliBilgiBaslik} onChange={(e) => patchForm((prev) => ({ ...prev, iletisimBolum: { ...prev.iletisimBolum, hizliBilgiBaslik: e.target.value } }))} />
            </Field>
            <LinesEditor label="Hızlı bilgi maddeleri" lines={il.hizliBilgi} onChange={(hizliBilgi) => setForm({ ...form, iletisimBolum: { ...il, hizliBilgi } })} />
            <Field label="Form başlık">
              <input className={inputCls} value={il.formBaslik} onChange={(e) => setForm({ ...form, iletisimBolum: { ...il, formBaslik: e.target.value } })} />
            </Field>
            <Field label="Form açıklama">
              <textarea rows={2} className={inputCls} value={il.formAciklama} onChange={(e) => setForm({ ...form, iletisimBolum: { ...il, formAciklama: e.target.value } })} />
            </Field>
            <Field label="Form varsayılan mesaj">
              <textarea rows={2} className={inputCls} value={il.formVarsayilanMesaj} onChange={(e) => setForm({ ...form, iletisimBolum: { ...il, formVarsayilanMesaj: e.target.value } })} />
            </Field>
          </div>
        ) : null}

        {tab === "navbar" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Marka adı">
                <input className={inputCls} value={form.navbar.markaAd} onChange={(e) => setForm({ ...form, navbar: { ...form.navbar, markaAd: e.target.value } })} />
              </Field>
              <Field label="Marka harfi (logo)">
                <input className={inputCls} value={form.navbar.markaHarf} onChange={(e) => setForm({ ...form, navbar: { ...form.navbar, markaHarf: e.target.value } })} />
              </Field>
            </div>
            {form.navbar.navLinks.map((link, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-2">
                <input className={inputCls} value={link.label} onChange={(e) => updateNavLink(i, { label: e.target.value })} />
                <input className={inputCls} value={link.href} onChange={(e) => updateNavLink(i, { href: e.target.value })} />
              </div>
            ))}
            <Field label="WhatsApp mesaj şablonu">
              <input className={inputCls} value={form.navbar.whatsappMesaj} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, whatsappMesaj: e.target.value } }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="WhatsApp buton metni">
                <input className={inputCls} value={form.navbar.whatsappLabel} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, whatsappLabel: e.target.value } }))} />
              </Field>
              <Field label="CRM demo buton">
                <input className={inputCls} value={form.navbar.crmDemoLabel} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, crmDemoLabel: e.target.value } }))} />
              </Field>
              <Field label="CRM demo link">
                <input className={inputCls} value={form.navbar.crmDemoHref} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, crmDemoHref: e.target.value } }))} />
              </Field>
              <Field label="Ana CTA buton">
                <input className={inputCls} value={form.navbar.ctaLabel} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, ctaLabel: e.target.value } }))} />
              </Field>
              <Field label="Ana CTA link">
                <input className={inputCls} value={form.navbar.ctaHref} onChange={(e) => patchForm((prev) => ({ ...prev, navbar: { ...prev.navbar, ctaHref: e.target.value } }))} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Mobil bar WhatsApp">
                <input className={inputCls} value={form.mobilBar.whatsappLabel} onChange={(e) => patchForm((prev) => ({ ...prev, mobilBar: { ...prev.mobilBar, whatsappLabel: e.target.value } }))} />
              </Field>
              <Field label="Mobil bar CTA">
                <input className={inputCls} value={form.mobilBar.ctaLabel} onChange={(e) => patchForm((prev) => ({ ...prev, mobilBar: { ...prev.mobilBar, ctaLabel: e.target.value } }))} />
              </Field>
              <Field label="Mobil bar CTA link">
                <input className={inputCls} value={form.mobilBar.ctaHref} onChange={(e) => patchForm((prev) => ({ ...prev, mobilBar: { ...prev.mobilBar, ctaHref: e.target.value } }))} />
              </Field>
            </div>
          </div>
        ) : null}

        {tab === "footer" ? (
          <div className="space-y-4">
            <Field label="Footer başlık">
              <input className={inputCls} value={form.footer.baslik} onChange={(e) => setForm({ ...form, footer: { ...form.footer, baslik: e.target.value } })} />
            </Field>
            <Field label="Footer açıklama">
              <textarea rows={3} className={inputCls} value={form.footer.aciklama} onChange={(e) => setForm({ ...form, footer: { ...form.footer, aciklama: e.target.value } })} />
            </Field>
            <Field label="WhatsApp buton metni">
              <input className={inputCls} value={form.footer.whatsappButon} onChange={(e) => setForm({ ...form, footer: { ...form.footer, whatsappButon: e.target.value } })} />
            </Field>
            <Field label="Telif satırı (© yıl otomatik eklenir)">
              <input className={inputCls} value={form.footer.telif} onChange={(e) => setForm({ ...form, footer: { ...form.footer, telif: e.target.value } })} />
            </Field>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-60">
          {saving ? "Kaydediliyor…" : "Tümünü kaydet"}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
          Anasayfayı önizle
        </a>
      </div>
    </div>
  );
}
