/** Format number as EUR: 1.234,56 € */
export function fmtEur(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format number in K: 1.234K */
export function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  }
  if (Math.abs(n) >= 1_000) {
    return (n / 1_000).toFixed(0) + "K";
  }
  return new Intl.NumberFormat("es-ES").format(n);
}

/** Format as percentage: 25,4% */
export function pct(n: number): string {
  return n.toFixed(1).replace(".", ",") + "%";
}

/** Format number with Spanish locale */
export function fmtNum(n: number, decimals = 0): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** Calculate percentage change */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Calculate percentage of target achieved */
export function pctTarget(current: number, target: number): number {
  if (target === 0) return 0;
  return (current / target) * 100;
}
