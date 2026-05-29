"use client";

import Image, { type ImageProps } from "next/image";

type Props = ImageProps & {
  /** Yerel /vitrin/* dosyalarında optimizer atlanır — VPS/IIS güvenilirliği */
  forceDirect?: boolean;
};

function isLocalVitrin(src: ImageProps["src"]): boolean {
  return typeof src === "string" && (src.startsWith("/vitrin/") || src.startsWith("/public/"));
}

/** Vitrin görselleri — yerel dosyalar doğrudan servis edilir (hızlı, kırılmaz) */
export function VitrinImage({ forceDirect, unoptimized, src, ...rest }: Props) {
  const direct = forceDirect || isLocalVitrin(src) || unoptimized;
  return <Image src={src} unoptimized={direct} {...rest} />;
}
