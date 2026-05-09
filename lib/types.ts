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

export type SiparisDurum = "beklemede" | "hazirlaniyor" | "tamamlandi" | "iptal";

export type SiparisSatir = {
  urunId: string;
  ad: string;
  fiyat: string;
  adet: number;
};

export type Siparis = {
  id: string;
  olusturulma: string;
  durum: SiparisDurum;
  kaynak: "mobil";
  musteriAd?: string;
  telefon: string;
  adres?: string;
  notlar?: string;
  satirlar: SiparisSatir[];
};

export type SiparisListesi = { siparisler: Siparis[] };
