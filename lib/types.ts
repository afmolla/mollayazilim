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

export type SiparisKaynak = "mobil" | "web";

export type OdemeDurum = "bekliyor" | "baslatildi" | "odendi" | "basarisiz" | "iptal";

export type SiparisSatir = {
  urunId: string;
  varyantId?: string;
  ad: string;
  fiyat: string;
  adet: number;
  birimFiyat?: number;
};

export type Siparis = {
  id: string;
  olusturulma: string;
  durum: SiparisDurum;
  kaynak: SiparisKaynak;
  odemeDurum?: OdemeDurum;
  odemeReferans?: string;
  musteriAd?: string;
  telefon: string;
  eposta?: string;
  firma?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  il?: string;
  ilce?: string;
  postaKodu?: string;
  adres?: string;
  notlar?: string;
  araToplam?: number;
  kdv?: number;
  toplam?: number;
  satirlar: SiparisSatir[];
};

export type SiparisListesi = { siparisler: Siparis[] };
