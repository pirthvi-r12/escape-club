"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { EXPERIENCES } from "@/lib/content";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BLUR_DATA_URL, photo } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Each frame drifts at its own rate so the grid never moves as one slab. */
const DEPTHS = [-90, 60, -50, 80];

const SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-7",
];

const RATIOS = [
  "aspect-[16/11]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[16/10]",
];

export function ExperienceMosaic() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-mosaic-plate]")
        .forEach((plate, i) => {
          gsap.fromTo(
            plate,
            { y: DEPTHS[i % DEPTHS.length] * -0.5 },
            {
              y: DEPTHS[i % DEPTHS.length] * 0.5,
              ease: "none",
              scrollTrigger: {
                trigger: plate.closest("figure"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        });

      /* Frames wipe open from the bottom edge as they arrive. */
      gsap.utils.toArray<HTMLElement>("[data-mosaic-mask]").forEach((frame) => {
        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: frame, start: "top 86%", once: true },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[92rem] px-6 py-[16svh] sm:px-10 lg:px-16"
    >
      <header className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-8 flex items-center gap-4">
            <span className="block h-px w-10 bg-champagne/50" />
            What we actually arrange
          </p>
          <SplitHeading
            as="h2"
            className="font-display max-w-2xl text-[length:var(--text-display)] leading-[1.02] tracking-[-0.03em] text-bone"
          >
            Four things that are hard to book alone.
          </SplitHeading>
        </div>
        <Reveal delay={0.15}>
          <p className="max-w-xs text-sm leading-relaxed text-mist-dim">
            Every one of these needs a permit, a pilot, or a person who owes us
            a favour. Usually all three.
          </p>
        </Reveal>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {EXPERIENCES.map((exp, i) => (
          <figure
            key={exp.title}
            className={cn("group relative", SPANS[i % SPANS.length])}
          >
            <div
              data-mosaic-mask
              className={cn(
                "relative w-full overflow-hidden rounded-[2px] bg-ink-800",
                RATIOS[i % RATIOS.length],
              )}
            >
              <div data-mosaic-plate className="gpu absolute inset-[-12%]">
                <Image
                  src={photo(exp.photoKey, { w: 1800 })}
                  alt={exp.title}
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 92vw, 58vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

              <figcaption className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                <p className="eyebrow mb-3 text-champagne/85">{exp.tag}</p>
                <h3 className="font-display text-[length:var(--text-title)] leading-[1.05] tracking-[-0.02em] text-bone">
                  {exp.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone-dim/80">
                  {exp.body}
                </p>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
