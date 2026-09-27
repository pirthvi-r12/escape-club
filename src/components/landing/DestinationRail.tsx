"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { SplitHeading } from "@/components/ui/SplitHeading";
import { DESTINATIONS } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { BLUR_DATA_URL, photo } from "@/lib/images";
import { formatCurrency } from "@/lib/utils";

/**
 * Eight destinations read as a horizontal film strip.
 *
 * On desktop the stage is held with `sticky` and the track is scrubbed
 * sideways, so vertical scroll reads as lateral camera movement. On touch it
 * degrades to a native snap-scroll carousel, which is what a thumb expects.
 */
export function DestinationRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        /* Scroll distance equals the overflow, so the strip moves 1:1. */
        const overflow = () =>
          Math.max(0, track.scrollWidth - window.innerWidth + 96);

        const sizeSection = () => {
          section.style.height = `${window.innerHeight + overflow()}px`;
        };
        sizeSection();

        const tween = gsap.to(track, {
          x: () => -overflow(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: sizeSection,
          },
        });

        /* Plates drift against the travel direction for parallax depth. */
        const plates = gsap.utils.toArray<HTMLElement>("[data-rail-plate]");
        const plateTween = gsap.to(plates, {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          plateTween.scrollTrigger?.kill();
          plateTween.kill();
          section.style.height = "";
          gsap.set([track, ...plates], { clearProps: "x,xPercent" });
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <>
      <header className="mx-auto max-w-[92rem] px-6 pt-[14svh] pb-14 sm:px-10 lg:px-16">
        <p className="eyebrow mb-8 flex items-center gap-4">
          <span className="block h-px w-10 bg-champagne/50" />
          Where members went this year
        </p>
        <SplitHeading
          as="h2"
          className="font-display max-w-3xl text-[length:var(--text-display)] leading-[1.02] tracking-[-0.03em] text-bone"
        >
          Eight places worth the difficulty.
        </SplitHeading>
      </header>

      <section ref={sectionRef} className="relative">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
          <div
            ref={trackRef}
            className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-8 sm:px-10 lg:overflow-x-visible lg:px-16 lg:pb-0"
          >
            {DESTINATIONS.map((dest, i) => (
              <article
                key={dest.slug}
                className="group relative w-[78vw] shrink-0 snap-center sm:w-[58vw] md:w-[44vw] lg:w-[30vw] xl:w-[26vw]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-ink-800">
                  <div
                    data-rail-plate
                    className="gpu absolute inset-[-14%]"
                  >
                    <Image
                      src={photo(dest.photoKey, { w: 1400 })}
                      alt={`${dest.name}, ${dest.country}`}
                      fill
                      quality={80}
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    />
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-ink-950/25" />

                  <span className="absolute top-5 left-5 text-[0.65rem] font-medium tracking-[0.3em] text-bone/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute inset-x-5 bottom-5">
                    <p className="eyebrow mb-2 text-champagne/90">
                      {dest.region} · {dest.country}
                    </p>
                    <h3 className="font-display text-3xl leading-none tracking-[-0.02em] text-bone">
                      {dest.name}
                    </h3>

                    {/* Held back until hover, then eased open */}
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] motion-reduce:grid-rows-[1fr]">
                      <div className="overflow-hidden">
                        <p className="pt-3 text-sm leading-relaxed text-bone-dim/85">
                          {dest.tagline}
                        </p>
                        <dl className="mt-4 flex gap-6 border-t border-white/12 pt-3 text-[0.7rem] tracking-[0.12em] text-mist uppercase">
                          <div>
                            <dt className="text-mist-dim">Peak</dt>
                            <dd className="mt-1 text-bone">{dest.elevation}</dd>
                          </div>
                          <div>
                            <dt className="text-mist-dim">Window</dt>
                            <dd className="mt-1 text-bone">{dest.season}</dd>
                          </div>
                          <div>
                            <dt className="text-mist-dim">From</dt>
                            <dd className="mt-1 text-bone">
                              {formatCurrency(dest.basePrice)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
