export function newVfId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `vf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
