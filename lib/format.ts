export function formatPrix(n: number | null | undefined, suffixe = " F"): string {
  if (n == null) return "—";
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + suffixe;
}
