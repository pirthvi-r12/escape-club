"use client";

import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

type CounterProps = {
  value: number;
  /** Decimal places — used for the 4.9/5 style figures. */
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Start immediately instead of waiting for the element to scroll in. */
  immediate?: boolean;
};

const formatter = (decimals: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Tallies up to `value`. The DOM text is written by GSAP, never by React. */
export function Counter({
  value,
  decimals = 0,
  duration = 2,
  className,
  prefix = "",
  suffix = "",
  immediate = false,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = formatter(decimals);
    const write = (n: number) => {
      el.textContent = `${prefix}${fmt.format(n)}${suffix}`;
    };

    if (prefersReducedMotion()) {
      write(value);
      return;
    }

    const proxy = { n: 0 };
    write(0);

    const tween = gsap.to(proxy, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => write(proxy.n),
      ...(immediate
        ? {}
        : {
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          }),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, decimals, duration, prefix, suffix, immediate]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter(decimals).format(value)}
      {suffix}
    </span>
  );
}
