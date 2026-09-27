"use client";

import { useEffect, useRef, type ElementType } from "react";

import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type SplitHeadingProps = {
  children: string;
  as?: ElementType;
  className?: string;
  /** "lines" gives the masked editorial reveal; "chars" is sharper and faster. */
  variant?: "lines" | "chars";
  /** Fire on mount (hero) or when scrolled into view (everything else). */
  trigger?: "load" | "scroll";
  delay?: number;
  stagger?: number;
};

export function SplitHeading({
  children,
  as: Tag = "h2",
  className,
  variant = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.removeAttribute("data-anim");
      return;
    }

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let scrollTrigger: ScrollTrigger | null = null;
    let cancelled = false;

    /* If fonts or SplitText stall, never leave the headline invisible. */
    const failSafe = window.setTimeout(() => {
      if (!cancelled) el.removeAttribute("data-anim");
    }, 1800);

    /* Splitting before webfonts settle measures the fallback metrics and the
       lines break in the wrong places. */
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      try {
        split = new SplitText(el, {
          type: variant === "chars" ? "chars" : "lines",
          linesClass: "split-line",
        });
      } catch {
        el.removeAttribute("data-anim");
        window.clearTimeout(failSafe);
        return;
      }

      const targets = variant === "chars" ? split.chars : split.lines;
      if (!targets?.length) {
        el.removeAttribute("data-anim");
        window.clearTimeout(failSafe);
        return;
      }

      el.removeAttribute("data-anim");
      window.clearTimeout(failSafe);

      const from =
        variant === "chars"
          ? { yPercent: 110, opacity: 0, filter: "blur(6px)" }
          : { yPercent: 108, opacity: 0 };

      const to =
        variant === "chars"
          ? {
              yPercent: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power3.out",
              stagger: stagger ?? 0.022,
              delay,
            }
          : {
              yPercent: 0,
              opacity: 1,
              duration: 1.25,
              ease: "expo.out",
              stagger: stagger ?? 0.11,
              delay,
            };

      gsap.set(targets, from);

      if (trigger === "load") {
        tween = gsap.to(targets, to);
      } else {
        tween = gsap.to(targets, {
          ...to,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
        scrollTrigger = tween.scrollTrigger ?? null;
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [children, variant, trigger, delay, stagger]);

  return (
    <Tag
      ref={ref}
      data-anim="pending"
      className={cn("gpu", className)}
    >
      {children}
    </Tag>
  );
}
