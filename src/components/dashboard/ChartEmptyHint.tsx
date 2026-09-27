import Link from "next/link";

export function ChartEmptyHint({
  message = "Add a trip or complete a departure to see this chart fill in.",
}: {
  message?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-ink-950/55 px-6 text-center backdrop-blur-[2px]">
      <p className="max-w-xs text-[0.78rem] leading-relaxed text-mist">{message}</p>
      <Link
        href="/dashboard/trips"
        className="pointer-events-auto text-[0.62rem] tracking-[0.18em] text-champagne uppercase hover:text-bone"
      >
        Build your roster →
      </Link>
    </div>
  );
}
