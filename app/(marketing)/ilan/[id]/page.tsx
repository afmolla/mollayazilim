import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareLinkButton } from "@/components/emlak/ShareLinkButton";
import { fmtIlanKonum, fmtIlanPrice } from "@/lib/emlak-format";
import { ilanById } from "@/lib/ilan-store";
import { getRequestSite } from "@/lib/site-request";
import { siteUrl } from "@/lib/site";
import { ayarlarGetir } from "@/lib/settings-store";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { subdir } = await getRequestSite();
  if (subdir !== "emlak") return {};
  const row = await ilanById(id);
  if (!row?.yayinda) return { title: "İlan" };
  const title = `${row.baslik} · ${fmtIlanPrice(row)}`;
  return {
    title: row.baslik,
    description: row.ozet.slice(0, 160),
    openGraph: { title: row.baslik, description: row.ozet },
  };
}

export default async function IlanDetayPage({ params }: Props) {
  const { id } = await params;
  const { subdir, prefix } = await getRequestSite();
  if (subdir !== "emlak") notFound();

  const row = await ilanById(id);
  if (!row?.yayinda) notFound();

  const base = prefix || "";
  const ayar = await ayarlarGetir();
  const canonicalBase = await siteUrl();
  const root = canonicalBase.replace(/\/$/, "");
  const shareUrl = `${root}${prefix}/ilan/${encodeURIComponent(row.id)}`;
  const waMsg = `Merhaba, şu ilanla ilgileniyorum: ${row.baslik}`;
  const waHref = whatsappLink(ayar.whatsapp, waMsg);

  const tarih = new Date(row.guncellenme).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="emlak-portal-root pb-16 pt-6 md:pt-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <nav className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)] shadow-[var(--emlak-shadow)]">
          <Link href={`${base}/ilanlar`} className="font-medium text-[var(--brand)] hover:underline">
            İlanlar
          </Link>
          <span className="mx-2 opacity-60">/</span>
          <span className="text-[var(--text)]">{row.baslik}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] shadow-[var(--emlak-shadow)]">
            <div className="relative aspect-[16/10] w-full bg-[var(--surface-3)]">
              <Image
                src={row.kapakSrc}
                alt={row.baslik}
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover"
                priority
              />
              <span className="absolute left-4 top-4 rounded-md bg-[var(--text)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--surface)]">
                {row.tip === "kiralik" ? "Kiralık" : "Satılık"}
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold leading-snug tracking-tight text-[var(--text)] md:text-3xl">
              {row.baslik}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{fmtIlanKonum(row)}</p>

            <p className="mt-6 text-3xl font-bold tabular-nums text-[var(--brand)] md:text-4xl">{fmtIlanPrice(row)}</p>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Oda</dt>
                <dd className="mt-1 font-semibold text-[var(--text)]">{row.oda}</dd>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">m²</dt>
                <dd className="mt-1 font-semibold text-[var(--text)]">{row.metrekare}</dd>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Güncelleme</dt>
                <dd className="mt-1 font-semibold text-[var(--text)]">{tarih}</dd>
              </div>
            </dl>

            <p className="mt-8 leading-relaxed text-[var(--muted)]">{row.ozet}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <ShareLinkButton url={shareUrl} />
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                WhatsApp ile yazın
              </a>
              <Link
                href={`${base}/ilanlar`}
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand)]/35"
              >
                Tüm ilanlar
              </Link>
            </div>

            <p className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs leading-relaxed text-[var(--muted)]">
              Bu sayfa demo vitrin içindir. Gerçek alım-satım ve hukuki süreçler için doğrudan danışmanınızla görüşünüz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
