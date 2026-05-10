import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestSite } from "@/lib/site-request";
import { ilanlarGetir, ilanlariFiltrele } from "@/lib/ilan-store";
import type { IlanKayit, IlanTip } from "@/lib/ilan-store";
import { fmtIlanKonum, fmtIlanPrice } from "@/lib/emlak-format";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "İlanlar",
  description:
    "Konut ilanları — soldan kategori ve lokasyon seçin; filtrelerle daraltın. Demo vitrin (örnek veri).",
};

function buildListHref(
  base: string,
  opts: {
    tip?: IlanTip | "";
    q?: string;
    il?: string;
    min?: string;
    max?: string;
  },
): string {
  const p = new URLSearchParams();
  const tip = opts.tip === "satilik" || opts.tip === "kiralik" ? opts.tip : "";
  if (tip) p.set("tip", tip);
  if (opts.q?.trim()) p.set("q", opts.q.trim());
  if (opts.il?.trim()) p.set("il", opts.il.trim());
  if (opts.min?.trim()) p.set("min", opts.min.trim());
  if (opts.max?.trim()) p.set("max", opts.max.trim());
  const qs = p.toString();
  return qs ? `${base}/ilanlar?${qs}` : `${base}/ilanlar`;
}

function SideNavLink(props: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={props.href}
      scroll={false}
      className={[
        "block rounded-lg px-3 py-2 text-sm transition",
        props.active
          ? "border border-[#ffd800]/80 bg-[#fffef5] font-semibold text-[#1a1a1a]"
          : "border border-transparent text-[#333] hover:border-[#ddd] hover:bg-white",
      ].join(" ")}
    >
      {props.children}
    </Link>
  );
}

export default async function IlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tip?: string; il?: string; min?: string; max?: string }>;
}) {
  const { subdir, prefix } = await getRequestSite();
  if (subdir !== "emlak") notFound();
  const base = prefix || "";

  const sp = await searchParams;
  const tip = (sp.tip === "kiralik" || sp.tip === "satilik" ? sp.tip : "") as IlanTip | "";
  const q = sp.q ?? "";
  const il = sp.il ?? "";
  const minFiyat = sp.min ? Number(sp.min.replace(/\D/g, "")) : undefined;
  const maxFiyat = sp.max ? Number(sp.max.replace(/\D/g, "")) : undefined;

  const all = await ilanlarGetir();
  const rows = ilanlariFiltrele(all, {
    tip,
    q,
    il,
    minFiyat: Number.isFinite(minFiyat) ? minFiyat : undefined,
    maxFiyat: Number.isFinite(maxFiyat) ? maxFiyat : undefined,
  });

  const filterCtx = { q, il, min: sp.min ?? "", max: sp.max ?? "" };

  const catTabs: { label: string; tip: "" | IlanTip }[] = [
    { label: "Tüm ilanlar", tip: "" },
    { label: "Satılık konut", tip: "satilik" },
    { label: "Kiralık konut", tip: "kiralik" },
  ];

  const cityQuick: { label: string; ilVal: string }[] = [
    { label: "İstanbul", ilVal: "İstanbul" },
    { label: "Tekirdağ", ilVal: "Tekirdağ" },
    { label: "Ankara", ilVal: "Ankara" },
    { label: "İzmir", ilVal: "İzmir" },
  ];

  return (
    <div className="emlak-portal-root min-h-[70vh] bg-[#ebebeb] pb-16 pt-0 md:pb-24">
      <div className="border-b border-[#d5d5d5] bg-[#ffd800]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#3d3d00] md:px-6">
          <span>Örnek ilan portalı — gerçek alım/satış/kiralama değildir</span>
          <span className="hidden sm:inline">Demo vitrin · Atlas Emlak şablonu</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-8">
        <div className="flex flex-col gap-3 border-b border-[#d0d0d0] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#666]">Konut · ikinci el</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1a1a] md:text-3xl">İlanlar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#555]">
              Sol menüden kategori ve şehir seçin; detaylı arama ile kelime ve fiyat daraltması yapın — klasified
              portal düzeni (demo).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-[#ccc] bg-white px-3 py-1.5 text-sm font-semibold text-[#222] shadow-sm">
              {rows.length} ilan
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 md:mt-6">
          {catTabs.map((t) => {
            const active = tip === t.tip;
            const href = buildListHref(base, { ...filterCtx, tip: t.tip });
            return (
              <Link
                key={t.label}
                href={href}
                scroll={false}
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[#1a1a1a] text-white shadow-md"
                    : "border border-[#ccc] bg-white text-[#333] hover:border-[#999]",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="mb-8 space-y-5 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <nav
                className="rounded-xl border border-[#d8d8d8] bg-white p-3 shadow-sm"
                aria-label="Kategori menüsü"
              >
                <p className="border-b border-[#eee] pb-2 text-xs font-bold uppercase tracking-wide text-[#888]">
                  Kategoriler
                </p>
                <div className="mt-2 space-y-1">
                  {catTabs.map((t) => (
                    <SideNavLink
                      key={`side-${t.label}`}
                      href={buildListHref(base, { ...filterCtx, tip: t.tip })}
                      active={tip === t.tip}
                    >
                      {t.label}
                    </SideNavLink>
                  ))}
                </div>
              </nav>

              <nav
                className="mt-4 rounded-xl border border-[#d8d8d8] bg-white p-3 shadow-sm"
                aria-label="Şehir seçimi"
              >
                <p className="border-b border-[#eee] pb-2 text-xs font-bold uppercase tracking-wide text-[#888]">
                  Popüler lokasyonlar
                </p>
                <div className="mt-2 space-y-1">
                  <SideNavLink href={buildListHref(base, { ...filterCtx, tip, il: "" })} active={il === ""}>
                    Tüm şehirler
                  </SideNavLink>
                  {cityQuick.map((c) => (
                    <SideNavLink
                      key={c.ilVal}
                      href={buildListHref(base, { ...filterCtx, tip, il: c.ilVal })}
                      active={il === c.ilVal}
                    >
                      {c.label}
                    </SideNavLink>
                  ))}
                </div>
              </nav>

              <div className="mt-4 rounded-xl border border-[#d8d8d8] bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[#888]">Detaylı arama</p>
                <form className="mt-3 space-y-3" method="get">
                  {tip ? <input type="hidden" name="tip" value={tip} /> : null}
                  <label className="block">
                    <span className="text-[11px] font-medium text-[#666]">Kelime</span>
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Mahalle, başlık…"
                      className="mt-1 w-full rounded-lg border border-[#ccc] bg-[#fafafa] px-2.5 py-2 text-sm text-[#222] outline-none ring-[#ffd800]/40 focus:ring-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-[#666]">İl / ilçe</span>
                    <input
                      name="il"
                      defaultValue={il}
                      placeholder="Örn. Kadıköy"
                      className="mt-1 w-full rounded-lg border border-[#ccc] bg-[#fafafa] px-2.5 py-2 text-sm text-[#222] outline-none ring-[#ffd800]/40 focus:ring-2"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[11px] font-medium text-[#666]">Min ₺</span>
                      <input
                        name="min"
                        defaultValue={sp.min ?? ""}
                        inputMode="numeric"
                        className="mt-1 w-full rounded-lg border border-[#ccc] bg-[#fafafa] px-2 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-[#666]">Max ₺</span>
                      <input
                        name="max"
                        defaultValue={sp.max ?? ""}
                        inputMode="numeric"
                        className="mt-1 w-full rounded-lg border border-[#ccc] bg-[#fafafa] px-2 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#ffd800] px-3 py-2.5 text-sm font-bold text-[#1a1a1a] shadow-sm hover:bg-[#f5d400]"
                  >
                    Ara
                  </button>
                  <Link
                    href={`${base}/ilanlar`}
                    className="block w-full rounded-lg border border-[#ccc] py-2 text-center text-sm font-medium text-[#444] hover:bg-[#f5f5f5]"
                  >
                    Sıfırla
                  </Link>
                </form>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <ul className="divide-y divide-[#ddd] overflow-hidden rounded-xl border border-[#ccc] bg-white shadow-sm">
              {rows.length === 0 ? (
                <li className="px-6 py-14 text-center">
                  <p className="font-semibold text-[#222]">Sonuç bulunamadı</p>
                  <p className="mt-2 text-sm text-[#666]">Filtreleri genişletin veya şehir seçimini temizleyin.</p>
                  <Link
                    href={`${base}/ilanlar`}
                    className="mt-6 inline-flex rounded-lg bg-[#ffd800] px-5 py-2.5 text-sm font-bold text-[#1a1a1a]"
                  >
                    Tüm ilanlara dön
                  </Link>
                </li>
              ) : (
                rows.map((x: IlanKayit) => (
                  <li key={x.id}>
                    <Link
                      href={`${base}/ilan/${encodeURIComponent(x.id)}`}
                      className="group flex flex-col gap-3 border-l-4 border-transparent p-4 transition hover:border-[#ffd800] hover:bg-[#fffef8] sm:flex-row sm:items-stretch sm:gap-4 sm:p-5"
                    >
                      <div className="relative h-44 shrink-0 overflow-hidden rounded-lg bg-[#eee] sm:h-auto sm:w-48 sm:min-h-[9rem]">
                        <Image
                          src={x.kapakSrc}
                          alt={x.baslik}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width:640px) 100vw, 192px"
                        />
                        <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          {x.tip === "kiralik" ? "Kiralık" : "Satılık"}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                        <h2 className="text-lg font-semibold leading-snug text-[#1a1a1a] group-hover:text-[#0369a1] md:text-xl">
                          {x.baslik}
                        </h2>
                        <p className="line-clamp-2 text-sm text-[#555]">{x.ozet}</p>
                        <p className="mt-1 text-xs text-[#777]">
                          {fmtIlanKonum(x)} · {x.oda} · {x.metrekare} m²
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-start justify-center border-t border-[#eee] pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 md:min-w-[10rem] md:items-end">
                        <p className="text-xl font-bold text-[#0369a1] md:text-2xl">{fmtIlanPrice(x)}</p>
                        <span className="mt-1 text-[11px] font-medium text-[#888]">İncele →</span>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
