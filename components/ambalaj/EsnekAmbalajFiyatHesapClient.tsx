"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWithBase } from "@/components/SitePrefixProvider";
import type { FiyatHesapIcerik } from "@/lib/fiyat-hesap-defaults";
import { fiyatFormEtiketleri, mergeFiyatHesap, VARSAYILAN_FIYAT_HESAP } from "@/lib/fiyat-hesap-defaults";
import type { EsnekAmbalajAracilik } from "@/lib/esnek-ambalaj-aracilik-store";
import {
  hesaplaAmbalajFiyat,
  malzemeEtiketi,
  type AmbalajFiyatGirdi,
  type AmbalajForm,
  type AmbalajMalzeme,
  type AmbalajUrunTipi,
} from "@/lib/esnek-ambalaj-pricing";

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none ring-[var(--brand)] focus:ring-2";

function Field(props: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[var(--text)]">{props.label}</span>
      <div className="mt-1">{props.children}</div>
      {props.hint ? <p className="mt-1 text-xs text-[var(--muted)]">{props.hint}</p> : null}
    </label>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export function EsnekAmbalajFiyatHesapClient(props: {
  whatsapp: string;
  firmaAd: string;
  aracilik: EsnekAmbalajAracilik;
  fiyatHesap?: FiyatHesapIcerik;
}) {
  const wb = useWithBase();
  const fh = mergeFiyatHesap(VARSAYILAN_FIYAT_HESAP, props.fiyatHesap);
  const fe = fiyatFormEtiketleri(fh.form);

  const [g, setG] = useState<AmbalajFiyatGirdi>({
    urunTipi: "torba",
    malzeme: "opp",
    form: "duz",
    mikron: 40,
    enMm: 200,
    boyMm: 300,
    metrajM: 1000,
    adet: 5000,
    baski: true,
    baskiRenk: 2,
    perfore: false,
    fermuar: false,
    pencere: false,
  });

  const sonuc = useMemo(() => hesaplaAmbalajFiyat(g, props.aracilik), [g, props.aracilik]);

  const waMesaj = encodeURIComponent(
    `Merhaba ${props.firmaAd}, fiyat hesaplayıcıdan talep:\n` +
      `Ürün: ${g.urunTipi === "torba" ? "Torba" : "Rulo"} · ${malzemeEtiketi(g.malzeme)}\n` +
      `Mikron: ${g.mikron} µm · En: ${g.enMm} mm` +
      (g.urunTipi === "torba" ? ` · Boy: ${g.boyMm} mm · Adet: ${g.adet}` : ` · Metraj: ${g.metrajM} m`) +
      `\nBaskı: ${g.baski ? `${g.baskiRenk} renk` : "Hayır"}\n` +
      `Tahmini aralık: ${fmt(sonuc.toplamMin)} – ${fmt(sonuc.toplamMax)} ₺ (KDV hariç)`,
  );
  const waHref = `https://wa.me/${props.whatsapp.replace(/\D/g, "")}?text=${waMesaj}`;

  function patch<K extends keyof AmbalajFiyatGirdi>(key: K, val: AmbalajFiyatGirdi[K]) {
    setG((s) => ({ ...s, [key]: val }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">{fh.rozet}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">{fh.baslik}</h1>
        <p className="mt-3 text-[var(--muted)]">{fh.aciklama}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={fe.urunTipi}>
              <select
                className={inputCls}
                value={g.urunTipi}
                onChange={(e) => patch("urunTipi", e.target.value as AmbalajUrunTipi)}
              >
                <option value="torba">Torba / poşet</option>
                <option value="rulo">Rulo / bobin</option>
              </select>
            </Field>
            <Field label={fe.malzeme}>
              <select
                className={inputCls}
                value={g.malzeme}
                onChange={(e) => patch("malzeme", e.target.value as AmbalajMalzeme)}
              >
                <option value="opp">OPP</option>
                <option value="cpp">CPP</option>
                <option value="pet">PET</option>
                <option value="ldpe">LDPE</option>
                <option value="bopp">BOPP</option>
                <option value="opp_cpp_lamine">OPP + CPP laminasyon</option>
                <option value="pet_pe_lamine">PET + PE laminasyon</option>
              </select>
            </Field>
            <Field label={fe.form}>
              <select className={inputCls} value={g.form} onChange={(e) => patch("form", e.target.value as AmbalajForm)}>
                <option value="duz">Düz torba / standart rulo</option>
                <option value="yan_kose">Yan körklü torba</option>
                <option value="doypack">Doypack / dik duran</option>
                <option value="shrink">Shrink / kolileme</option>
                <option value="dolum_rulo">Otomatik dolum rulosu</option>
              </select>
            </Field>
            <Field label={fe.mikron} hint={fe.mikronIpucu}>
              <input
                type="number"
                min={15}
                max={200}
                className={inputCls}
                value={g.mikron}
                onChange={(e) => patch("mikron", Number(e.target.value) || 40)}
              />
            </Field>
            <Field label={fe.en}>
              <input
                type="number"
                min={40}
                className={inputCls}
                value={g.enMm}
                onChange={(e) => patch("enMm", Number(e.target.value) || 100)}
              />
            </Field>
            {g.urunTipi === "torba" ? (
              <>
                <Field label={fe.boy}>
                  <input
                    type="number"
                    min={60}
                    className={inputCls}
                    value={g.boyMm}
                    onChange={(e) => patch("boyMm", Number(e.target.value) || 200)}
                  />
                </Field>
                <Field label={fe.adet}>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    className={inputCls}
                    value={g.adet}
                    onChange={(e) => patch("adet", Number(e.target.value) || 1000)}
                  />
                </Field>
              </>
            ) : (
              <Field label={fe.metraj} hint={fe.metrajIpucu}>
                <input
                  type="number"
                  min={100}
                  step={100}
                  className={inputCls}
                  value={g.metrajM}
                  onChange={(e) => patch("metrajM", Number(e.target.value) || 500)}
                />
              </Field>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={g.baski} onChange={(e) => patch("baski", e.target.checked)} />
              <span className="font-medium text-[var(--text)]">{fe.baski}</span>
            </label>
            {g.baski ? (
              <div className="mt-4">
                <Field label={fe.baskiRenk}>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    className={inputCls}
                    value={g.baskiRenk}
                    onChange={(e) => patch("baskiRenk", Number(e.target.value) || 1)}
                  />
                </Field>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <input type="checkbox" checked={g.perfore} onChange={(e) => patch("perfore", e.target.checked)} />
              {fe.perfore}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <input type="checkbox" checked={g.fermuar} onChange={(e) => patch("fermuar", e.target.checked)} />
              {fe.fermuar}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <input type="checkbox" checked={g.pencere} onChange={(e) => patch("pencere", e.target.checked)} />
              {fe.pencere}
            </label>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--surface)] p-6 shadow-lg">
            <p className="text-sm font-semibold text-[var(--muted)]">{fh.sonucBaslik}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--brand)]">
              {fmt(sonuc.toplamMin)} – {fmt(sonuc.toplamMax)} ₺
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{fh.sonucAgirlik}</dt>
                <dd className="font-medium tabular-nums text-[var(--text)]">{sonuc.tahminiKg} kg</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{fh.sonucBirim}</dt>
                <dd className="font-medium tabular-nums text-[var(--text)]">{fmt(sonuc.satisBirimKg)} ₺/kg</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{fh.sonucTeslim}</dt>
                <dd className="font-medium tabular-nums text-[var(--text)]">
                  {sonuc.teslimGunMin}–{sonuc.teslimGunMax} iş günü
                </dd>
              </div>
              {sonuc.baskiBedeli > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">{fh.sonucBaski}</dt>
                  <dd className="font-medium tabular-nums text-[var(--text)]">{fmt(sonuc.baskiBedeli)} ₺</dd>
                </div>
              ) : null}
              {sonuc.kalipBedeli > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">{fh.sonucKlise}</dt>
                  <dd className="font-medium tabular-nums text-[var(--text)]">{fmt(sonuc.kalipBedeli)} ₺</dd>
                </div>
              ) : null}
              {sonuc.ekOzellikBedeli > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">{fh.sonucEk}</dt>
                  <dd className="font-medium tabular-nums text-[var(--text)]">{fmt(sonuc.ekOzellikBedeli)} ₺</dd>
                </div>
              ) : null}
            </dl>
            <ul className="mt-5 space-y-1.5 text-xs text-[var(--muted)]">
              {sonuc.notlar.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              {fh.waButon}
            </a>
            <Link
              href={wb("/randevu")}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold hover:bg-[var(--surface-3)]"
            >
              {fh.randevuButon}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
