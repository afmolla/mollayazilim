import type { Metadata } from "next";
import { sayfaBySlug } from "@/lib/pages-store";
import { notFound } from "next/navigation";
import { CmsPageInteractive } from "@/components/vf-inline/CmsPageInteractive";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await sayfaBySlug(slug);
  if (!s || !s.yayin) return {};
  const index = s.seoIndex !== false;
  return {
    title: s.baslik,
    description: s.aciklama,
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const s = await sayfaBySlug(slug);
  if (!s || !s.yayin) return notFound();

  return <CmsPageInteractive slug={slug} initial={s} />;
}
