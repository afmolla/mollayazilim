/** Basit semver (major.minor.patch) — mobil zorunlu güncelleme için yeterli */

export function parseSemver(v: string): [number, number, number] | null {
  const t = v.trim();
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(t);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** `a` < `b` ise true */
export function semverLt(a: string, b: string): boolean {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return false;
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return true;
    if (pa[i] > pb[i]) return false;
  }
  return false;
}
