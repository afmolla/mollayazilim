/** YouTube / Vimeo — yalnızca bilinen kalıplar; iframe src sabit host */

export type EmbedInfo =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string };

export function parseVideoUrl(raw: string): EmbedInfo | null {
  const u = raw.trim();
  if (!u) return null;
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return id ? { provider: "youtube", id } : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return { provider: "youtube", id: v };
      const embed = url.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed?.[1]) return { provider: "youtube", id: embed[1] };
      const shortPath = url.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortPath?.[1]) return { provider: "youtube", id: shortPath[1] };
    }

    if (host === "vimeo.com") {
      const m = url.pathname.match(/^\/(\d+)/);
      if (m?.[1]) return { provider: "vimeo", id: m[1] };
    }
  } catch {
    return null;
  }
  return null;
}

export function embedIframeSrc(info: EmbedInfo): string {
  if (info.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(info.id)}`;
  }
  return `https://player.vimeo.com/video/${encodeURIComponent(info.id)}`;
}
