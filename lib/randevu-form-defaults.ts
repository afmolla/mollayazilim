/**
 * `content.json` içinde `randevuForm.options` boş veya eksik kaldığında
 * vitrin `subdir` değerine göre yedek liste (kuaför seçenekleri restorana sızmasın).
 */
export function defaultRandevuOptionsForSubdir(subdir: string): string[] {
  switch (subdir) {
    case "restaurant":
      return [
        "2 kişi — iç mekan",
        "4 kişi — iç mekan",
        "6+ kişi — grup / iş yemeği",
        "Teras / bahçe",
        "Doğum günü / özel süsleme",
        "Paket servis / gel-al",
        "Şef menüsü (ön bildirim)",
      ];
    case "avukat":
      return [
        "Ceza / soruşturma",
        "İş hukuku",
        "Aile hukuku",
        "İcra / alacak",
        "Şirketler & sözleşme",
        "KVKK / uyum",
        "Diğer",
      ];
    case "otoyikama":
      return [
        "Standart dış yıkama",
        "İç + dış komple paket",
        "Motor yıkama",
        "Tek aşama pasta cila",
        "Çift aşama parlatma",
        "Seramik kaplama (9H)",
        "Seramik ön muayene",
        "Cam filmi / PPF bilgi",
      ];
    case "kuafor-kadin":
      return [
        "Kesim & şekillendirme",
        "Fön & profesyonel şekillendirme",
        "Tam boya / röfle / balyaj",
        "Keratin & onarıcı bakım",
        "Düğün & özel gün paketi",
        "Kaş & kirpik (bilgi)",
        "Manikür / pedikür (bilgi)",
      ];
    case "kuafor":
    default:
      return [
        "Saç kesimi",
        "Sakal şekillendirme",
        "Saç + sakal paket",
        "Fön / şekillendirme",
        "Boyama / röfle",
        "Keratin / bakım",
      ];
  }
}
