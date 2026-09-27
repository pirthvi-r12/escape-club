"use client";

import { Counter } from "@/components/ui/Counter";
import { IconArrowUp } from "@/components/ui/Icon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { StatsDTO } from "@/types";

/** Sparkline drawn as a single path — no chart library for four tiles. */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 30 - (v / max) * 26;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-8 w-full"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-champagne)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-champagne)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,32 ${points.join(" ")} 100,32`}
        fill="url(#spark-fill)"
        stroke="none"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--color-champagne)"
        strokeWidth="1.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatTiles({ stats }: { stats: StatsDTO }) {
  const monthlyMiles = stats.milesByMonth.map((m) => m.miles);
  const monthlyTrips = stats.milesByMonth.map((m) => m.trips);

  const tiles = [
    {
      label: "Miles travelled",
      value: stats.totals.miles,
      decimals: 0,
      note: "Completed trips, round-trip from London",
      spark: monthlyMiles,
    },
    {
      label: "Trips completed",
      value: stats.totals.trips,
      decimals: 0,
      note: `${stats.totals.nights} nights away`,
      spark: monthlyTrips,
    },
    {
      label: "Countries visited",
      value: stats.totals.countries,
      decimals: 0,
      note: `${stats.byRegion.length} regions on the map`,
      spark: stats.byRegion.map((r) => r.trips),
    },
    {
      label: "Member rating given",
      value: stats.totals.avgRating,
      decimals: 1,
      suffix: "/5",
      note: "Across every rated departure",
      spark: monthlyMiles.map((m) => (m > 0 ? 5 : 3)),
    },
  ];

  return (
    <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <RevealItem key={tile.label}>
          <article className="glass glass-sheen group relative h-full overflow-hidden rounded-2xl p-6">
            <p className="eyebrow text-[0.6rem]">{tile.label}</p>

            <p className="font-display mt-5 text-4xl leading-none tracking-[-0.03em] text-bone">
              <Counter
                value={tile.value}
                decimals={tile.decimals}
                suffix={tile.suffix}
                duration={1.8}
              />
            </p>

            <p className="mt-3 text-[0.72rem] leading-relaxed text-mist-dim">
              {tile.note}
            </p>

            <div className="mt-5 -mb-1 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
              <Sparkline values={tile.spark} />
            </div>
          </article>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function TierProgress({ stats }: { stats: StatsDTO }) {
  return (
    <article className="glass glass-sheen rounded-2xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-[0.6rem]">Standing</p>
          <p className="font-display mt-4 text-3xl leading-none tracking-[-0.02em] text-bone">
            {stats.tier.current.charAt(0) +
              stats.tier.current.slice(1).toLowerCase()}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-champagne/25 bg-champagne/10 px-3 py-1.5 text-[0.62rem] tracking-[0.18em] text-champagne uppercase">
          <IconArrowUp className="h-3 w-3" />
          {stats.tier.progress}%
        </span>
      </div>

      <div className="mt-6">
        <span className="block h-1 w-full overflow-hidden rounded-full bg-white/8">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-champagne-deep via-champagne to-champagne-soft transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${stats.tier.progress}%` }}
          />
        </span>
        <p className="mt-4 text-[0.72rem] leading-relaxed text-mist-dim">
          {stats.tier.next
            ? `${stats.tier.milesToNext.toLocaleString("en-US")} miles to ${
                stats.tier.next.charAt(0) + stats.tier.next.slice(1).toLowerCase()
              }.`
            : "Top of the roster. Nothing left to climb here."}
        </p>
      </div>
    </article>
  );
}
