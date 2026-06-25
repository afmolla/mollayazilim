import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { urunBySlug, urunlerGetir, urunYayinda } from "@/lib/urun-store";
import { ProductDetailClient } from "@/components/ambalaj/ProductDetailClient";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const urun = await urunBySlug(slug);
  if (!urun) return { title: "Ürün bulunamadı" };
  return {
    title: urun.baslik,
    description: urun.ozet,
    openGraph: urun.imageSrc ? { images: [{ url: urun.imageSrc }] } : undefined,
  };
}

export default async function UrunDetayPage({ params }: Params) {
  const { slug } = await params;
  const urun = await urunBySlug(slug);
  if (!urun || !urunYayinda(await urunlerGetir()).some((x) => x.id === urun.id)) {
    notFound();
  }
  return <ProductDetailClient urun={urun} />;
}
