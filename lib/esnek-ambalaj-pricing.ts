/** Esnek ambalaj fiyat motoru — maliyet + satış marjı */

import type { EsnekAmbalajAracilik } from "@/lib/esnek-ambalaj-aracilik-store";

export type AmbalajUrunTipi = "torba" | "rulo";
export type AmbalajMalzeme =
  | "opp"
  | "cpp"
  | "pet"
  | "ldpe"
  | "bopp"
  | "opp_cpp_lamine"
  | "pet_pe_lamine";

export type AmbalajForm = "duz" | "yan_kose" | "doypack" | "shrink" | "dolum_rulo";

export type AmbalajFiyatGirdi = {
  urunTipi: AmbalajUrunTipi;
  malzeme: AmbalajMalzeme;
  form: AmbalajForm;
  mikron: number;
  enMm: number;
  boyMm: number;
  metrajM: number;
  adet: number;
  baski: boolean;
  baskiRenk: number;
  perfore: boolean;
  fermuar: boolean;
  pencere: boolean;
};

export type AmbalajFiyatSonuc = {
  tahminiKg: number;
  tedarikBirimKg: number;
  satisBirimKg: number;
  tedarikMalzemeBedeli: number;
  aracilikBedeli: number;
  baskiBedeli: number;
  ekOzellikBedeli: number;
  kalipBedeli: number;
  tedarikAraToplam: number;
  minSiparisFarki: number;
  toplamMin: number;
  toplamMax: number;
  teslimGunMin: number;
  teslimGunMax: number;
  notlar: string[];
};

const MALZEME_ETIKET: Record<AmbalajMalzeme, string> = {
  opp: "OPP (Oriented PP)",
  cpp: "CPP (Cast PP)",
  pet: "PET",
  ldpe: "LDPE",
  bopp: "BOPP",
  opp_cpp_lamine: "OPP + CPP Laminasyon",
  pet_pe_lamine: "PET + PE Laminasyon",
};

/** Varsayılan kg maliyeti (TL/kg) — panelden güncellenir */
export const VARSAYILAN_TEDARIK_KG: Record<AmbalajMalzeme, number> = {
  opp: 76,
  cpp: 82,
  pet: 102,
  ldpe: 64,
  bopp: 78,
  opp_cpp_lamine: 114,
  pet_pe_lamine: 128,
};

const YOGUNLUK: Record<AmbalajMalzeme, number> = {
  opp: 0.91,
  cpp: 0.91,
  pet: 1.38,
  ldpe: 0.92,
  bopp: 0.91,
  opp_cpp_lamine: 0.95,
  pet_pe_lamine: 1.05,
};

const FORM_CARPAN: Record<AmbalajForm, number> = {
  duz: 1,
  yan_kose: 1.12,
  doypack: 1.35,
  shrink: 1.08,
  dolum_rulo: 1.05,
};

export function malzemeEtiketi(m: AmbalajMalzeme): string {
  return MALZEME_ETIKET[m];
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function tedarikKgFiyat(m: AmbalajMalzeme, cfg: EsnekAmbalajAracilik): number {
  return cfg.tedarikciKgFiyat[m] ?? VARSAYILAN_TEDARIK_KG[m];
}

export function tahminiKg(g: AmbalajFiyatGirdi): number {
  const mikron = clamp(g.mikron, 15, 200);
  const en = clamp(g.enMm, 40, 2000);
  const yog = YOGUNLUK[g.malzeme];
  const kalinlikM = mikron / 1_000_000;
  const formC = FORM_CARPAN[g.form];

  if (g.urunTipi === "rulo") {
    const metraj = clamp(g.metrajM, 100, 50_000);
    const kg = (en / 1000) * metraj * kalinlikM * yog * formC;
    return Math.max(kg, 0.1);
  }

  const boy = clamp(g.boyMm, 60, 3000);
  const adet = clamp(g.adet, 1, 5_000_000);
  const alanM2 = (2 * (en / 1000) * (boy / 1000)) * formC;
  const kgBirim = alanM2 * kalinlikM * yog;
  return Math.max(kgBirim * adet, 0.05);
}

export function hesaplaAmbalajFiyat(
  g: AmbalajFiyatGirdi,
  cfg: EsnekAmbalajAracilik,
): AmbalajFiyatSonuc {
  const notlar: string[] = [];
  const kg = tahminiKg(g);
  const mikron = clamp(g.mikron, 15, 200);
  const mikronCarpan = mikron <= 30 ? 0.92 : mikron <= 50 ? 1 : mikron <= 80 ? 1.08 : 1.18;

  let tedarikBirimKg = tedarikKgFiyat(g.malzeme, cfg) * mikronCarpan;
  if (g.urunTipi === "rulo" && g.form === "dolum_rulo") tedarikBirimKg *= 1.06;

  const marjCarpan = 1 + cfg.aracilikMarjYuzde / 100;
  const satisBirimKg = tedarikBirimKg * marjCarpan;

  const tedarikMalzemeBedeli = kg * tedarikBirimKg;
  const satisMalzemeBedeli = kg * satisBirimKg;
  const aracilikBedeli = satisMalzemeBedeli - tedarikMalzemeBedeli;

  let kalipBedeli = 0;
  let baskiBedeli = 0;
  if (g.baski) {
    const renk = clamp(g.baskiRenk, 1, 8);
    kalipBedeli = (2000 + renk * 700) * marjCarpan;
    baskiBedeli = satisMalzemeBedeli * (0.1 + renk * 0.03);
    notlar.push("Baskılı siparişlerde klise hazırlığı ilk seferde uygulanır; baskı onayı sonrası netleşir.");
  }

  let ekOzellikBedeli = 0;
  if (g.perfore) ekOzellikBedeli += kg * 4.5 * marjCarpan;
  if (g.fermuar) {
    ekOzellikBedeli +=
      g.urunTipi === "torba" ? clamp(g.adet, 1, 5_000_000) * 0.32 * marjCarpan : kg * 16 * marjCarpan;
  }
  if (g.pencere) {
    ekOzellikBedeli +=
      g.urunTipi === "torba" ? clamp(g.adet, 1, 5_000_000) * 0.26 * marjCarpan : kg * 11 * marjCarpan;
  }

  const tedarikAraToplam = satisMalzemeBedeli + baskiBedeli + ekOzellikBedeli + kalipBedeli;

  let minSiparisFarki = 0;
  if (kg < cfg.minSiparisKg) {
    minSiparisFarki = tedarikAraToplam * (cfg.kucukPartiEkYuzde / 100);
    notlar.push(`${cfg.minSiparisKg} kg altı siparişlerde küçük parti farkı uygulanır.`);
  }

  const toplam = tedarikAraToplam + minSiparisFarki;
  notlar.push(
    `Tahmini teslim: ${cfg.teslimGunMin}–${cfg.teslimGunMax} iş günü (stok ve baskı onayına bağlı).`,
  );
  const sabitNotlar = (cfg.musteriNotlari ?? []).filter(Boolean);
  if (sabitNotlar.length > 0) {
    notlar.push(...sabitNotlar);
  } else {
    notlar.push("Fiyatlar KDV hariç tahminidir; kesin teklif numune ve baskı onayı sonrası 48 saat içinde yazılır.");
    notlar.push("Laminasyon, kilitli torba ve özel barrier katmanları keşif sonrası netleşir.");
  }

  return {
    tahminiKg: Math.round(kg * 100) / 100,
    tedarikBirimKg: Math.round(tedarikBirimKg * 100) / 100,
    satisBirimKg: Math.round(satisBirimKg * 100) / 100,
    tedarikMalzemeBedeli: Math.round(tedarikMalzemeBedeli),
    aracilikBedeli: Math.round(aracilikBedeli),
    baskiBedeli: Math.round(baskiBedeli),
    ekOzellikBedeli: Math.round(ekOzellikBedeli),
    kalipBedeli: Math.round(kalipBedeli),
    tedarikAraToplam: Math.round(tedarikAraToplam),
    minSiparisFarki: Math.round(minSiparisFarki),
    toplamMin: Math.round(toplam * 0.96),
    toplamMax: Math.round(toplam * 1.06),
    teslimGunMin: cfg.teslimGunMin,
    teslimGunMax: cfg.teslimGunMax,
    notlar,
  };
}
