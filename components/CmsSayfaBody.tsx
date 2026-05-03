import type { SayfaBlok } from "@/lib/cms-blok";
import type { Sayfa } from "@/lib/pages-store";
import { embedIframeSrc, parseVideoUrl } from "@/lib/video-embed";

function CmsBlock({ block }: { block: SayfaBlok }) {
  if (block.type === "heading") {
    return block.level === 3 ? <h3>{block.text}</h3> : <h2>{block.text}</h2>;
  }
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "list")
    return (
      <ul>
        {block.items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  if (block.type === "divider") return <hr />;
  if (block.type === "button") {
    return (
      <p>
        <a
          href={block.href}
          target={block.newTab ? "_blank" : undefined}
          rel={block.newTab ? "noreferrer" : undefined}
          className="inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-[var(--on-brand)] no-underline"
        >
          {block.label}
        </a>
      </p>
    );
  }
  if (block.type === "image") {
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS kaynaklı harici URL */}
        <img src={block.src} alt={block.alt} className="w-full rounded-2xl border border-[var(--border)]" />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="my-6 whitespace-pre-wrap border-l-4 border-[var(--brand)] pl-4 italic text-[var(--text)]">
        {block.text}
        {block.kaynak ? (
          <cite className="mt-2 block text-sm not-italic text-[var(--muted)]">— {block.kaynak}</cite>
        ) : null}
      </blockquote>
    );
  }
  if (block.type === "video") {
    const info = parseVideoUrl(block.url);
    if (!info) {
      return <p className="text-sm text-red-600">Geçersiz video adresi (YouTube veya Vimeo).</p>;
    }
    return (
      <div className="relative my-6 aspect-video overflow-hidden rounded-2xl border border-[var(--border)]">
        <iframe
          src={embedIframeSrc(info)}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Video"
        />
      </div>
    );
  }
  if (block.type === "html") {
    return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  return null;
}

/** CMS sayfası gövdesi (bloklar veya HTML) — sunucu ve istemci ortak */
export function CmsSayfaBody({ sayfa }: { sayfa: Sayfa }) {
  if (sayfa.bloklar && sayfa.bloklar.length > 0) {
    return (
      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        {sayfa.bloklar.map((b, i) => (
          <CmsBlock key={i} block={b} />
        ))}
      </div>
    );
  }
  return (
    <div
      className="prose prose-neutral mt-10 max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: sayfa.icerikHtml }}
    />
  );
}
