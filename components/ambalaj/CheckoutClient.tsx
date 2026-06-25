"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/components/ambalaj/CartProvider";
import { formatTry } from "@/lib/urun-types";
import { publicHref } from "@/lib/base-path";
import { useWithBase } from "@/components/SitePrefixProvider";

export function CheckoutClient() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const ph = (href: string) => publicHref(href, pathname);
  const wb = useWithBase();
  const cart = useCart();

  const [musteriAd, setMusteriAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [eposta, setEposta] = useState("");
  const [firma, setFirma] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [vergiDairesi, setVergiDairesi] = useState("");
  const [il, setIl] = useState("");
  const [ilce, setIlce] = useState("");
  const [postaKodu, setPostaKodu] = useState("");
  const [adres, setAdres] = useState("");
  const [notlar, setNotlar] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (cart.items.length === 0) {
    return (
      <div className="ambalaj-shop mx-auto max-w-3xl px-4 py-16 text-center text-emerald-50">
        <p>Sepetiniz boş.</p>
        <Link href={ph("/urunler")} className="mt-4 inline-block text-emerald-400 underline">
          Mağazaya dön
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!kvkk) {
      setErr("Mesafeli satış sözleşmesini onaylamanız gerekir.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(wb("/api/public/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          musteriAd,
          telefon,
          eposta,
          firma,
          vergiNo,
          vergiDairesi,
          il,
          ilce,
          postaKodu,
          adres,
          notlar,
          odemeBaslat: true,
          satirlar: cart.items.map((x) => ({
            urunId: x.urunId,
            varyantId: x.varyantId,
            miktar: x.miktar,
          })),
        }),
      });
      const j = (await res.json()) as { ok?: boolean; id?: string; error?: string; payment?: { message?: string } };
      if (!res.ok || !j.ok || !j.id) {
        setErr(j.error ?? "Sipariş oluşturulamadı.");
        return;
      }
      cart.clear();
      router.push(ph(`/siparis-onay/${j.id}`));
    } catch {
      setErr("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-emerald-50 outline-none ring-emerald-400 focus:ring-2";

  return (
    <div className="ambalaj-shop mx-auto max-w-5xl px-4 py-8 text-emerald-50 md:px-8">
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">Ödeme & teslimat</h1>
      <p className="mt-2 text-sm text-emerald-100/60">
        Siparişiniz kaydedilecek. Ödeme entegrasyonu aktif olduğunda bu adımdan devam edeceksiniz.
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/80">İletişim</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-emerald-100/70">Ad soyad *</span>
                <input required value={musteriAd} onChange={(e) => setMusteriAd(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">Telefon *</span>
                <input required value={telefon} onChange={(e) => setTelefon(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">E-posta</span>
                <input type="email" value={eposta} onChange={(e) => setEposta(e.target.value)} className={inputCls} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/80">Fatura (isteğe bağlı)</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-emerald-100/70">Firma / ünvan</span>
                <input value={firma} onChange={(e) => setFirma(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">Vergi no</span>
                <input value={vergiNo} onChange={(e) => setVergiNo(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">Vergi dairesi</span>
                <input value={vergiDairesi} onChange={(e) => setVergiDairesi(e.target.value)} className={inputCls} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/80">Teslimat adresi</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">İl</span>
                <input value={il} onChange={(e) => setIl(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">İlçe</span>
                <input value={ilce} onChange={(e) => setIlce(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-emerald-100/70">Posta kodu</span>
                <input value={postaKodu} onChange={(e) => setPostaKodu(e.target.value)} className={inputCls} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-emerald-100/70">Adres</span>
                <textarea value={adres} onChange={(e) => setAdres(e.target.value)} rows={3} className={inputCls} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-emerald-100/70">Sipariş notu</span>
                <textarea value={notlar} onChange={(e) => setNotlar(e.target.value)} rows={2} className={inputCls} />
              </label>
            </div>
          </section>

          <label className="flex items-start gap-3 text-xs text-emerald-100/60">
            <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5" />
            <span>
              Mesafeli satış sözleşmesini ve kişisel verilerin işlenmesine ilişkin aydınlatmayı okudum, kabul ediyorum.
            </span>
          </label>

          {err ? <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">{err}</p> : null}
        </div>

        <aside className="h-fit rounded-2xl border border-emerald-500/15 bg-emerald-950/40 p-5">
          <h2 className="text-sm font-bold text-white">Sipariş özeti</h2>
          <ul className="mt-4 space-y-2 text-xs text-emerald-100/70">
            {cart.items.map((x) => (
              <li key={`${x.urunId}:${x.varyantId}`}>
                {x.baslik} · {x.varyantEtiket}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold text-emerald-300">{formatTry(cart.total)}</p>
          <p className="text-[10px] text-emerald-100/45">KDV dahil</p>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Kaydediliyor…" : "Siparişi tamamla"}
          </button>
          <p className="mt-3 text-[10px] leading-relaxed text-emerald-100/40">
            Ödeme API bağlandığında bu buton ödeme sayfasına yönlendirecek. Şimdilik sipariş kaydı oluşturulur.
          </p>
        </aside>
      </form>
    </div>
  );
}
