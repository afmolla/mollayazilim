/**
 * Ödeme sağlayıcı entegrasyonu için hazır iskelet.
 * Gerçek API (iyzico, PayTR vb.) bağlandığında bu modül güncellenecek.
 */

export type PaymentInitRequest = {
  siparisId: string;
  toplam: number;
  musteriAd: string;
  eposta?: string;
  telefon: string;
  callbackUrl: string;
};

export type PaymentInitResult = {
  ok: boolean;
  paymentToken?: string;
  redirectUrl?: string;
  provider?: string;
  message?: string;
};

export type PaymentVerifyRequest = {
  paymentToken: string;
  siparisId: string;
};

export type PaymentVerifyResult = {
  ok: boolean;
  odendi: boolean;
  referans?: string;
  message?: string;
};

/** Ödeme başlat — şimdilik stub; sipariş kaydedilir, ödeme bekler. */
export async function initiatePayment(req: PaymentInitRequest): Promise<PaymentInitResult> {
  const token = `PENDING_${req.siparisId}_${Date.now()}`;
  return {
    ok: true,
    paymentToken: token,
    provider: "stub",
    message:
      "Ödeme entegrasyonu henüz aktif değildir. Siparişiniz kaydedildi; satış ekibimiz sizinle iletişime geçecektir.",
  };
}

/** Ödeme doğrula — gerçek API callback'i buraya bağlanacak. */
export async function verifyPayment(req: PaymentVerifyRequest): Promise<PaymentVerifyResult> {
  void req;
  return {
    ok: true,
    odendi: false,
    message: "Ödeme doğrulama henüz yapılandırılmadı.",
  };
}
