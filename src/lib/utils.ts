type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Minimal class joiner — keeps the bundle free of clsx/tailwind-merge. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    out.push(String(v));
  };
  values.forEach(walk);
  return out.join(" ");
}

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatNumber = (n: number) => numberFormatter.format(n);

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDateRange = (start: Date | string, end: Date | string) => {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const month = (d: Date) => d.toLocaleString("en-US", { month: "short" });
  return sameMonth
    ? `${month(s)} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`
    : `${month(s)} ${s.getDate()} – ${month(e)} ${e.getDate()}, ${e.getFullYear()}`;
};

/** "3 hours ago" style relative label for the live activity feed. */
export function timeAgo(date: Date | string): string {
  const then = new Date(date).getTime();
  const seconds = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Deterministic pseudo-random so server and client renders agree. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
