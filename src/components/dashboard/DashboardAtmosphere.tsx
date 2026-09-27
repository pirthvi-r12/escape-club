import Image from "next/image";

import { Reveal } from "@/components/ui/Reveal";
import { BLUR_DATA_URL } from "@/lib/images";

type Slide = { src: string; label: string; meta: string };

export function DashboardAtmosphere({ slides }: { slides: Slide[] }) {
  return (
    <Reveal>
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/8">
        <div className="grid h-[11rem] grid-cols-3 sm:h-[14rem]">
          {slides.map((slide, i) => (
            <div key={slide.label} className="relative min-w-0">
              <Image
                src={slide.src}
                alt={slide.label}
                fill
                priority={i === 0}
                quality={78}
                sizes="33vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
              <div
                className={`absolute inset-0 ${
                  i === 1
                    ? "bg-ink-950/25"
                    : "bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/50 via-transparent to-ink-950/50" />

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="eyebrow text-[0.58rem] text-champagne/90">
              Member canvas
            </p>
            <p className="font-display mt-2 max-w-md text-xl leading-tight text-bone sm:text-2xl">
              Quiet peaks, open water, long horizons — your year takes shape here.
            </p>
          </div>
          <ul className="hidden gap-6 sm:flex">
            {slides.map((slide) => (
              <li key={slide.label} className="text-right">
                <p className="text-[0.72rem] text-bone">{slide.label}</p>
                <p className="text-[0.62rem] tracking-[0.14em] text-mist-dim uppercase">
                  {slide.meta}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
