import { Reveal } from "@/components/ui/Reveal";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { StatsDTO, TripDTO } from "@/types";

export function TravelInsights({
  stats,
  trips,
}: {
  stats: StatsDTO;
  trips: TripDTO[];
}) {
  const busiest = [...stats.milesByMonth].sort((a, b) => b.miles - a.miles)[0];
  const topRegion = stats.byRegion[0];
  const booked = trips.filter((t) => t.status === "BOOKED").length;
  const dreaming = trips.filter((t) => t.status === "DREAMING").length;
  const avgSpend =
    stats.totals.trips > 0
      ? Math.round(stats.totals.spend / Math.max(1, stats.totals.trips))
      : 0;

  const insights = [
    {
      label: "Busiest month",
      value: busiest?.month ?? "—",
      detail: busiest ? `${formatNumber(busiest.miles)} mi flown` : "No trips yet",
    },
    {
      label: "Favourite region",
      value: topRegion?.region ?? "—",
      detail: topRegion
        ? `${topRegion.trips} departures · ${formatNumber(topRegion.miles)} mi`
        : "Still exploring",
    },
    {
      label: "Pipeline",
      value: `${booked + dreaming}`,
      detail: `${booked} booked · ${dreaming} on the list`,
    },
    {
      label: "Avg. spend / trip",
      value: avgSpend ? formatCurrency(avgSpend) : "—",
      detail: `${formatCurrency(stats.totals.spend)} lifetime`,
    },
  ];

  return (
    <Reveal delay={0.12}>
      <section className="glass glass-sheen rounded-2xl p-6">
        <header className="mb-6">
          <p className="eyebrow text-[0.6rem]">Insights</p>
          <h2 className="font-display mt-2 text-2xl leading-none tracking-[-0.02em] text-bone">
            Patterns from your roster
          </h2>
        </header>

        <dl className="grid gap-5 sm:grid-cols-2">
          {insights.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4"
            >
              <dt className="text-[0.58rem] tracking-[0.2em] text-mist-dim uppercase">
                {row.label}
              </dt>
              <dd className="font-display mt-2 text-2xl leading-none text-bone">
                {row.value}
              </dd>
              <dd className="mt-2 text-[0.72rem] text-mist-dim">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Reveal>
  );
}
