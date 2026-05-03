import { yayindakiRandevular } from "@/lib/randevu-store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onaylı randevu listesi",
  description:
    "Panelden onaylanmış randevu örnekleri — demo içerik; gerçek işletmede KVKK’ya uygun maskeleme önerilir.",
};

export const dynamic = "force-dynamic";

function tarihLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function RandevularPage() {
  const list = await yayindakiRandevular();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <h1 className="text-3xl font-bold text-[var(--text)]">Randevu listesi</h1>
      <p className="mt-2 text-[var(--muted)]">
        Bu sayfa yalnızca <strong>onaylanmış</strong> randevuları gösterir — panel akışıyla
        uyumlu demo. Bekleyen talepler panelde kalır.
      </p>
      <ul className="mt-10 space-y-4">
        {list.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--text)]">{r.ad}</p>
                <p className="text-sm text-[var(--muted)]">{r.hizmet}</p>
                {r.notlar ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">Not: {r.notlar}</p>
                ) : null}
              </div>
              <div className="text-right text-sm text-[var(--muted)]">
                <div>{tarihLabel(r.tarih)}</div>
                <div className="font-medium text-[var(--text)]">{r.saat}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 ? (
        <p className="mt-10 text-center text-[var(--muted)]">
          Henüz onaylı randevu yok. Panelden bir talebi onaylayın veya demo verilerini kullanın.
        </p>
      ) : null}
    </div>
  );
}
