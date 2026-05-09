import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  apiBaseUrl,
  clientVersionDisplay,
  fetchAppMeta,
  fetchPublicMenu,
  submitPublicOrder,
} from "./src/api";
import type { QrMenuData, QrMenuUrun } from "./src/types";

type CartLine = { urun: QrMenuUrun; adet: number };

type Gate = "loading" | "update_required" | "siparis_kapali" | "ready" | "error";

export default function App() {
  const [gate, setGate] = useState<Gate>("loading");
  const [menu, setMenu] = useState<QrMenuData | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [updateInfo, setUpdateInfo] = useState<{ min: string; cur: string } | null>(null);

  const [cart, setCart] = useState<Record<string, CartLine>>({});

  const [telefon, setTelefon] = useState("");
  const [musteriAd, setMusteriAd] = useState("");
  const [adres, setAdres] = useState("");
  const [notlar, setNotlar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const bootstrap = useCallback(async () => {
    setGate("loading");
    setLoadErr("");
    setMenu(null);
    setUpdateInfo(null);
    try {
      const meta = await fetchAppMeta();
      if (meta.status === "update_required") {
        setUpdateInfo({ min: meta.minVersion, cur: meta.clientVersion });
        setGate("update_required");
        return;
      }
      if (meta.status === "error") {
        setLoadErr(meta.message);
        setGate("error");
        return;
      }
      if (!meta.mobilSiparisAcik) {
        setGate("siparis_kapali");
        return;
      }
      const j = await fetchPublicMenu();
      if ("code" in j && j.code === "APP_UPDATE_REQUIRED") {
        setUpdateInfo({
          min: j.minVersion ?? "",
          cur: j.clientVersion ?? clientVersionDisplay(),
        });
        setGate("update_required");
        return;
      }
      if (!j.ok || !("menu" in j) || !j.menu) {
        setLoadErr((j as { error?: string }).error ?? "Menü alınamadı");
        setGate("error");
        return;
      }
      setMenu(j.menu);
      setGate("ready");
    } catch {
      setLoadErr("Bağlantı hatası — API adresini kontrol edin.");
      setGate("error");
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  function addToCart(u: QrMenuUrun) {
    setCart((c) => {
      const cur = c[u.id];
      const nextAdet = (cur?.adet ?? 0) + 1;
      return { ...c, [u.id]: { urun: u, adet: nextAdet } };
    });
  }

  function decFromCart(urunId: string) {
    setCart((c) => {
      const cur = c[urunId];
      if (!cur) return c;
      if (cur.adet <= 1) {
        const { [urunId]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [urunId]: { ...cur, adet: cur.adet - 1 } };
    });
  }

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartLines.reduce((n, l) => n + l.adet, 0), [cartLines]);

  async function siparisVer() {
    setSubmitMsg("");
    const satirlar = cartLines.map((l) => ({ urunId: l.urun.id, adet: l.adet }));
    if (satirlar.length === 0) {
      setSubmitMsg("Sepete ürün ekleyin.");
      return;
    }
    if (!telefon.trim()) {
      setSubmitMsg("Telefon zorunlu.");
      return;
    }
    setSubmitting(true);
    try {
      const j = await submitPublicOrder({
        telefon: telefon.trim(),
        musteriAd: musteriAd.trim() || undefined,
        adres: adres.trim() || undefined,
        notlar: notlar.trim() || undefined,
        satirlar,
      });
      if (j.code === "APP_UPDATE_REQUIRED") {
        setUpdateInfo({
          min: j.minVersion ?? "",
          cur: j.clientVersion ?? clientVersionDisplay(),
        });
        setGate("update_required");
        setSubmitMsg("");
        return;
      }
      if (j.ok && j.id) {
        setSubmitMsg(`Sipariş alındı: ${j.id.slice(0, 8)}… Panel → Siparişler’de görünür.`);
        setCart({});
        setNotlar("");
      } else {
        setSubmitMsg(j.error ?? "Gönderilemedi");
      }
    } catch {
      setSubmitMsg("Ağ hatası");
    } finally {
      setSubmitting(false);
    }
  }

  if (gate === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Sunucu kontrol ediliyor…</Text>
        <Text style={styles.apiHint}>
          Uygulama v{clientVersionDisplay()} · {apiBaseUrl()}
        </Text>
      </View>
    );
  }

  if (gate === "update_required") {
    return (
      <View style={styles.center}>
        <Text style={styles.blockTitle}>Güncelleme gerekli</Text>
        <Text style={styles.err}>
          Bu sürüm artık kullanılamıyor. Yeni sürümü yükleyin; ardından tekrar açın.
        </Text>
        {updateInfo ? (
          <Text style={styles.muted}>
            Gerekli: {updateInfo.min || "?"} · Sizde: {updateInfo.cur}
          </Text>
        ) : null}
        <Text style={styles.apiHint}>API: {apiBaseUrl()}</Text>
        <Pressable style={styles.btn} onPress={() => void bootstrap()}>
          <Text style={styles.btnText}>Tekrar kontrol et</Text>
        </Pressable>
      </View>
    );
  }

  if (gate === "siparis_kapali") {
    return (
      <View style={styles.center}>
        <Text style={styles.blockTitle}>Sipariş kapalı</Text>
        <Text style={styles.muted}>İşletme mobil siparişi geçici olarak kapatmış olabilir.</Text>
        <Pressable style={styles.btn} onPress={() => void bootstrap()}>
          <Text style={styles.btnText}>Yenile</Text>
        </Pressable>
        <Text style={styles.apiHint}>API: {apiBaseUrl()}</Text>
      </View>
    );
  }

  if (gate === "error" || !menu) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{loadErr || "Menü yok"}</Text>
        <Pressable style={styles.btn} onPress={() => void bootstrap()}>
          <Text style={styles.btnText}>Yeniden dene</Text>
        </Pressable>
        <Text style={styles.apiHint}>API: {apiBaseUrl()}</Text>
      </View>
    );
  }

  const sortedCats = [...menu.kategoriler].sort((a, b) => a.sira - b.sira);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Text style={styles.title}>{menu.baslik}</Text>
        <Text style={styles.sub}>{menu.altBaslik}</Text>
        <Text style={styles.apiHint}>Sepet: {cartCount} · {apiBaseUrl()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad}>
        {sortedCats.map((kat) => (
          <View key={kat.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{kat.baslik}</Text>
            {[...kat.ogeler]
              .sort((a, b) => a.sira - b.sira)
              .map((u) => (
                <View key={u.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    {u.gorselSrc ? (
                      <Image source={{ uri: u.gorselSrc }} style={styles.thumb} accessibilityLabel={u.gorselAlt ?? u.ad} />
                    ) : (
                      <View style={[styles.thumb, styles.thumbPlaceholder]} />
                    )}
                    <View style={styles.cardBody}>
                      <Text style={styles.itemTitle}>{u.ad}</Text>
                      {u.aciklama ? <Text style={styles.itemDesc}>{u.aciklama}</Text> : null}
                      <Text style={styles.price}>{u.fiyat}</Text>
                      <View style={styles.rowBtns}>
                        <Pressable style={styles.smallBtn} onPress={() => decFromCart(u.id)}>
                          <Text style={styles.smallBtnTxt}>−</Text>
                        </Pressable>
                        <Text style={styles.qty}>{cart[u.id]?.adet ?? 0}</Text>
                        <Pressable style={styles.smallBtnPrimary} onPress={() => addToCart(u)}>
                          <Text style={styles.smallBtnTxt}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        ))}

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Sipariş</Text>
          <TextInput
            style={styles.input}
            placeholder="Telefon *"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={telefon}
            onChangeText={setTelefon}
          />
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#94a3b8"
            value={musteriAd}
            onChangeText={setMusteriAd}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Teslimat adresi (isteğe bağlı)"
            placeholderTextColor="#94a3b8"
            value={adres}
            onChangeText={setAdres}
            multiline
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Notlar"
            placeholderTextColor="#94a3b8"
            value={notlar}
            onChangeText={setNotlar}
            multiline
          />
          {submitMsg ? <Text style={styles.feedback}>{submitMsg}</Text> : null}
          <Pressable
            style={[styles.btnPrimary, submitting && { opacity: 0.6 }]}
            disabled={submitting}
            onPress={() => void siparisVer()}
          >
            <Text style={styles.btnPrimaryTxt}>{submitting ? "Gönderiliyor…" : "Siparişi gönder"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0f172a", gap: 12 },
  hero: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#020617", borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  title: { fontSize: 22, fontWeight: "800", color: "#f8fafc" },
  sub: { marginTop: 6, fontSize: 14, color: "#94a3b8" },
  scrollPad: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#e2e8f0", marginBottom: 10 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardRow: { flexDirection: "row", gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#334155" },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#f1f5f9" },
  itemDesc: { marginTop: 4, fontSize: 13, color: "#94a3b8" },
  price: { marginTop: 6, fontSize: 14, fontWeight: "600", color: "#38bdf8" },
  rowBtns: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  smallBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnPrimary: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnTxt: { color: "#fff", fontSize: 18, fontWeight: "700" },
  qty: { fontSize: 15, fontWeight: "700", color: "#e2e8f0", minWidth: 24, textAlign: "center" },
  form: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#334155" },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#f8fafc",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  btn: { marginTop: 8, backgroundColor: "#6366f1", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnPrimary: { marginTop: 4, backgroundColor: "#22c55e", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnPrimaryTxt: { color: "#052e16", fontWeight: "800", fontSize: 16 },
  muted: { color: "#94a3b8", marginTop: 8 },
  err: { color: "#fca5a5", textAlign: "center" },
  apiHint: { fontSize: 11, color: "#64748b", marginTop: 4 },
  feedback: { color: "#a7f3d0", marginBottom: 8, fontSize: 14 },
  blockTitle: { fontSize: 20, fontWeight: "800", color: "#f8fafc", textAlign: "center" },
});
