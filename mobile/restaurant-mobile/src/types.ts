export type QrMenuUrun = {
  id: string;
  ad: string;
  aciklama?: string;
  gorselSrc?: string;
  gorselAlt?: string;
  fiyat: string;
  sira: number;
};

export type QrMenuKategori = {
  id: string;
  baslik: string;
  aciklama?: string;
  sira: number;
  ogeler: QrMenuUrun[];
};

export type QrMenuData = {
  baslik: string;
  altBaslik: string;
  yayin: boolean;
  guncellenme: string;
  kategoriler: QrMenuKategori[];
};
