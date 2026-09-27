"use client";

import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { CLUB_STATS } from "@/lib/content";

export function StatsBand() {
  return (
    <section className="relative border-y border-white/8">
      <div className="mx-auto grid max-w-[92rem] grid-cols-2 gap-y-12 px-6 py-20 sm:px-10 lg:grid-cols-4 lg:px-16">
        {CLUB_STATS.map((stat, i) => {
          const decimals = Number.isInteger(stat.value) ? 0 : 1;
          return (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="border-white/8 lg:border-r lg:pr-8 lg:last:border-r-0"
            >
              <p className="font-display text-5xl leading-none tracking-[-0.03em] text-bone sm:text-6xl">
                <Counter
                  value={stat.value}
                  decimals={decimals}
                  suffix={stat.suffix}
                  duration={2.2}
                />
              </p>
              <p className="eyebrow mt-4">{stat.label}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
