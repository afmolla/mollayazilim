export type RandevuDurum = "beklemede" | "onaylandi" | "iptal";

export type Randevu = {
  id: string;
  ad: string;
  telefon: string;
  hizmet: string;
  tarih: string;
  saat: string;
  durum: RandevuDurum;
  notlar?: string;
  olusturulma: string;
};

export type RandevuListesi = { randevular: Randevu[] };
