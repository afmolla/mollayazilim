/** Demo fiyat motoru — gerçek teklif yerine yönlendirme amaçlı tahmini aralık. */

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
  birimFiyatKg: number;
  baskiBedeli: number;
  ekOzellikBedeli: number;
  kalipBedeli: number;
  araToplam: number;
  minSiparisFarki: number;
  toplamMin: number;
  toplamMax: number;
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

const MALZEME_FIYAT_KG: Record<AmbalajMalzeme, number> = {
  opp: 88,
  cpp: 95,
  pet: 118,
  ldpe: 74,
  bopp: 91,
  opp_cpp_lamine: 132,
  pet_pe_lamine: 148,
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

/** kg tahmini — endüstriyel yaklaşık formül (demo). */
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

export function hesaplaAmbalajFiyat(g: AmbalajFiyatGirdi): AmbalajFiyatSonuc {
  const notlar: string[] = [];
  const kg = tahminiKg(g);
  const mikron = clamp(g.mikron, 15, 200);
  const mikronCarpan = mikron <= 30 ? 0.92 : mikron <= 50 ? 1 : mikron <= 80 ? 1.08 : 1.18;

  let birimKg = MALZEME_FIYAT_KG[g.malzeme] * mikronCarpan;
  if (g.urunTipi === "rulo" && g.form === "dolum_rulo") birimKg *= 1.06;

  const malzemeBedeli = kg * birimKg;

  let kalipBedeli = 0;
  let baskiBedeli = 0;
  if (g.baski) {
    const renk = clamp(g.baskiRenk, 1, 8);
    kalipBedeli = 2200 + renk * 750;
    baskiBedeli = malzemeBedeli * (0.12 + renk * 0.035);
    notlar.push("Baskılı siparişlerde klise / klişe hazırlık bedeli ilk seferde uygulanır.");
  }

  let ekOzellikBedeli = 0;
  if (g.perfore) ekOzellikBedeli += kg * 4.5;
  if (g.fermuar) ekOzellikBedeli += g.urunTipi === "torba" ? clamp(g.adet, 1, 5_000_000) * 0.35 : kg * 18;
  if (g.pencere) ekOzellikBedeli += g.urunTipi === "torba" ? clamp(g.adet, 1, 5_000_000) * 0.28 : kg * 12;

  const araToplam = malzemeBedeli + baskiBedeli + ekOzellikBedeli + kalipBedeli;

  let minSiparisFarki = 0;
  if (kg < 40) {
    minSiparisFarki = araToplam * 0.14;
    notlar.push("40 kg altı siparişlerde küçük parti farkı uygulanır.");
  }

  const toplam = araToplam + minSiparisFarki;
  notlar.push("Fiyatlar KDV hariç tahminidir; kesin teklif için numune / baskı onayı gerekir.");
  notlar.push("Laminasyon, kilitli torba ve özel barrier katmanları keşif sonrası netleşir.");

  return {
    tahminiKg: Math.round(kg * 100) / 100,
    birimFiyatKg: Math.round(birimKg * 100) / 100,
    baskiBedeli: Math.round(baskiBedeli),
    ekOzellikBedeli: Math.round(ekOzellikBedeli),
    kalipBedeli: Math.round(kalipBedeli),
    araToplam: Math.round(araToplam),
    minSiparisFarki: Math.round(minSiparisFarki),
    toplamMin: Math.round(toplam * 0.94),
    toplamMax: Math.round(toplam * 1.08),
    notlar,
  };
}
