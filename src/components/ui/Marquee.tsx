"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite ticker. Duplicating the track and translating by exactly -50%
 * gives a seamless loop with one composited transform and no JS per frame.
 */
export function Marquee({
  items,
  speed = 38,
  reverse = false,
  className,
}: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div
        className="flex shrink-0 items-center gap-14 whitespace-nowrap pr-14 will-change-transform"
        style={{
          animation: `marquee-slide ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-14 text-[0.7rem] font-medium tracking-[0.3em] text-mist-dim uppercase"
          >
            {item}
            <span aria-hidden className="text-champagne/50">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
