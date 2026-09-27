"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartEmptyHint } from "@/components/dashboard/ChartEmptyHint";
import { Reveal } from "@/components/ui/Reveal";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { StatsDTO } from "@/types";

const AXIS = {
  stroke: "rgba(255,255,255,0.10)",
  tick: { fill: "#666d7e", fontSize: 10, letterSpacing: "0.08em" },
} as const;

type TooltipRow = { name?: string; value?: number | string; color?: string };

function GlassTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string | number;
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-deep rounded-lg px-4 py-3 shadow-2xl shadow-black/50">
      <p className="text-[0.6rem] tracking-[0.2em] text-mist-dim uppercase">
        {label}
      </p>
      {payload.map((row) => (
        <p
          key={row.name}
          className="mt-1.5 flex items-center gap-2 text-[0.8rem] text-bone"
        >
          <span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ background: row.color ?? "var(--color-champagne)" }}
          />
          <span className="text-mist">{row.name}</span>
          <span className="ml-auto tabular-nums">
            {format ? format(Number(row.value)) : String(row.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`glass glass-sheen rounded-2xl p-6 ${className ?? ""}`}>
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-[0.92rem] text-bone">{title}</h2>
        <p className="text-[0.62rem] tracking-[0.18em] text-mist-dim uppercase">
          {meta}
        </p>
      </header>
      {children}
    </article>
  );
}

export function MilesChart({
  stats,
  hasTripData = true,
}: {
  stats: StatsDTO;
  hasTripData?: boolean;
}) {
  return (
    <Reveal>
      <Panel title="Miles travelled" meta="Rolling 12 months">
        <div className="relative h-64 w-full">
          {!hasTripData && <ChartEmptyHint />}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.milesByMonth}
              margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
            >
              <defs>
                <linearGradient id="miles-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-champagne)"
                    stopOpacity={0.42}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-champagne)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={AXIS.tick}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={AXIS.tick}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
                width={48}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.16)", strokeWidth: 1 }}
                content={<GlassTooltip format={(v) => `${formatNumber(v)} mi`} />}
              />
              <Area
                type="monotone"
                dataKey="miles"
                name="Miles"
                stroke="var(--color-champagne)"
                strokeWidth={1.6}
                fill="url(#miles-fill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-champagne)",
                  stroke: "#2e2910",
                  strokeWidth: 2,
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </Reveal>
  );
}

const REGION_COLORS = [
  "var(--color-champagne)",
  "var(--color-glacier)",
  "var(--color-champagne-deep)",
  "#5d7f93",
  "var(--color-ember)",
  "#7a6a4f",
];

export function RegionChart({
  stats,
  hasTripData = true,
}: {
  stats: StatsDTO;
  hasTripData?: boolean;
}) {
  return (
    <Reveal delay={0.08}>
      <Panel title="Where the miles went" meta="By region">
        <div className="relative h-64 w-full">
          {!hasTripData && (
            <ChartEmptyHint message="Regions appear once you log completed miles or book a departure." />
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.byRegion}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
              barSize={14}
            >
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(255,255,255,0.07)"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={AXIS.tick}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <YAxis
                type="category"
                dataKey="region"
                axisLine={false}
                tickLine={false}
                tick={{ ...AXIS.tick, fontSize: 11 }}
                width={78}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<GlassTooltip format={(v) => `${formatNumber(v)} mi`} />}
              />
              <Bar
                dataKey="miles"
                name="Miles"
                radius={[0, 3, 3, 0]}
                animationDuration={1400}
                animationEasing="ease-out"
              >
                {stats.byRegion.map((row, i) => (
                  <Cell
                    key={row.region}
                    fill={REGION_COLORS[i % REGION_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </Reveal>
  );
}

export function SpendChart({
  stats,
  hasTripData = true,
}: {
  stats: StatsDTO;
  hasTripData?: boolean;
}) {
  return (
    <Reveal delay={0.16}>
      <Panel title="Spend against allowance" meta="By quarter">
        <div className="relative h-56 w-full">
          {!hasTripData && <ChartEmptyHint />}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.spendByQuarter}
              margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="quarter"
                axisLine={false}
                tickLine={false}
                tick={AXIS.tick}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={AXIS.tick}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                width={46}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<GlassTooltip format={(v) => formatCurrency(v)} />}
              />
              <Bar
                dataKey="budget"
                name="Allowance"
                fill="rgba(255,255,255,0.09)"
                radius={[3, 3, 0, 0]}
                animationDuration={1100}
              />
              <Bar
                dataKey="spend"
                name="Spent"
                fill="var(--color-glacier)"
                fillOpacity={0.9}
                radius={[3, 3, 0, 0]}
                animationDuration={1400}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </Reveal>
  );
}
