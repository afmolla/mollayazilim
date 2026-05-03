/** wa.me için telefon: ülke kodu ile, sadece rakam */
export function telefonTemizle(tel: string): string {
  return tel.replace(/\D/g, "");
}

export function whatsappRandevuMesaji(params: {
  ad: string;
  tarih: string;
  saat: string;
  hizmet: string;
  salonAd?: string;
}): string {
  const salon = params.salonAd ?? "Salonumuz";
  return (
    `Merhaba ${params.ad}, ${salon} randevu bilginiz:\n\n` +
    `• Tarih: ${params.tarih}\n` +
    `• Saat: ${params.saat}\n` +
    `• Hizmet: ${params.hizmet}\n\n` +
    `Randevunuz onaylanmıştır. Görüşmek üzere!`
  );
}

export function whatsappLink(telefon: string, mesaj: string): string {
  const num = telefonTemizle(telefon);
  if (!num) return "#";
  const q = encodeURIComponent(mesaj);
  return `https://wa.me/${num}?text=${q}`;
}
