"use client";

import { useMemo, useState } from "react";

type Props = {
  submitUrl?: string;
  sourcePath?: string;
  defaultMessage?: string;
  whatsapp?: string;
  formBaslik?: string;
  formAciklama?: string;
};

type Status = "idle" | "sending" | "sent" | "error";

function waMeLink(phone: string, text: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "#";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function MollaLeadForm(props: Props) {
  const submitUrl = props.submitUrl ?? "/api/lead";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState(props.defaultMessage ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");

  const canSend = name.trim().length >= 2 && phone.trim().length >= 7 && status !== "sending";

  const waText = useMemo(() => {
    const c = company.trim();
    const m = message.trim();
    const parts = [
      "Merhaba, Molla CRM hakkında bilgi ve demo almak istiyorum.",
      c ? `İşletme: ${c}` : "",
      name.trim() ? `İsim: ${name.trim()}` : "",
      phone.trim() ? `Telefon: ${phone.trim()}` : "",
      m ? `Not: ${m}` : "",
    ].filter(Boolean);
    return parts.join("\n");
  }, [company, message, name, phone]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          company,
          message,
          sourcePath: props.sourcePath,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Gönderim başarısız");
      }
      setStatus("sent");
    } catch (e2) {
      setStatus("error");
      setErr(e2 instanceof Error ? e2.message : "Bir hata oluştu");
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{props.formBaslik ?? "Hızlı teklif al"}</p>
          <p className="mt-1 text-sm text-white/70">
            {props.formAciklama ?? "30 saniyede formu gönderin; aynı zamanda WhatsApp'tan direkt yazabilirsiniz."}
          </p>
        </div>
        <a
          href={waMeLink(props.whatsapp ?? process.env.NEXT_PUBLIC_MOLLA_WHATSAPP ?? "905551234567", waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          WhatsApp
        </a>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="grid min-w-0 gap-1">
          <span className="text-xs font-semibold text-white/70">Ad soyad</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            placeholder="Örn: Ahmet Yılmaz"
            autoComplete="name"
          />
        </label>
        <label className="grid min-w-0 gap-1">
          <span className="text-xs font-semibold text-white/70">Telefon</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            placeholder="Örn: 05xx xxx xx xx"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label className="grid min-w-0 gap-1 md:col-span-2">
          <span className="text-xs font-semibold text-white/70">İşletme / sektör (opsiyonel)</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            placeholder="Örn: Kuaför · Kapaklı"
            autoComplete="organization"
          />
        </label>
        <label className="grid min-w-0 gap-1 md:col-span-2">
          <span className="text-xs font-semibold text-white/70">Kısaca ihtiyaç</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-28 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            placeholder="Örn: Kuaför sitesi + panel + randevu, 1 hafta içinde yayına almak istiyorum."
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSend}
            className={[
              "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition",
              canSend
                ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-black hover:opacity-95"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
            ].join(" ")}
          >
            {status === "sending" ? "Gönderiliyor…" : status === "sent" ? "Gönderildi" : "Formu gönder"}
          </button>

          {status === "sent" ? (
            <span className="text-sm text-white/70">Tamamdır. En kısa sürede dönüş yapacağız.</span>
          ) : status === "error" ? (
            <span className="text-sm text-red-200">{err || "Gönderim başarısız"}</span>
          ) : (
            <span className="text-xs text-white/50">Gönderince panel/lead kaydına düşer.</span>
          )}
        </div>
      </form>
    </div>
  );
}

