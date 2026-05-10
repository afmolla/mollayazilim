"use client";

import Link from "next/link";
import type { MouseEvent as ReactMouseEvent } from "react";
import { EditableText } from "@/components/vf-inline/EditableText";

export function CtaBlock(props: {
  inline: boolean;
  className: string;
  href: string;
  label: string;
  onLabel: (v: string) => void;
  onCtxHref: (e: ReactMouseEvent) => void;
}) {
  const { inline, className, href, label, onLabel, onCtxHref } = props;
  if (!inline) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <div className="inline-flex flex-col gap-0.5">
      <span className={`${className} inline-flex`} onContextMenu={onCtxHref}>
        <EditableText active value={label} onCommit={onLabel} className="font-semibold" />
      </span>
      <Link
        href={href}
        className="text-[11px] font-medium text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
        tabIndex={0}
      >
        Linki aç →
      </Link>
    </div>
  );
}
