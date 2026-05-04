/** Panel JSON yazımı başarısız → kullanıcıya / API’ye güvenli mesaj */
export function describePersistError(err: unknown): string {
  if (!(err instanceof Error)) return "Kayıt başarısız.";
  const m = err.message ?? "";
  const low = m.toLowerCase();
  if (
    low.includes("erofs") ||
    low.includes("read-only") ||
    low.includes("eio") ||
    low.includes("enospc") ||
    low.includes("eperm")
  ) {
    return "Sunucu veri dosyasına yazamıyor (salt okunur veya izin yok). Vercel’de kalıcı disk yoksa JSON kaydı çalışmaz; kendi sunucunuzda veya yazılabilir bir ortamda çalıştırın ve data klasörüne yazma izni verin.";
  }
  return m || "Kayıt başarısız.";
}
