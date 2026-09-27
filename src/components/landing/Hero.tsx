"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { MagneticLink } from "@/components/ui/MagneticLink";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BLUR_DATA_URL, photo } from "@/lib/images";

const HERO_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO;

/**
 * Fullscreen opening frame.
 *
 * Depth comes from four independently-moving plates: the alpine plate, a
 * screen-blended star field, a drifting fog gradient and the type itself.
 * Mouse parallax and the scroll pull-back are both written by GSAP directly to
 * transforms, so React never re-renders during the animation.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [useVideo, setUseVideo] = useState(Boolean(HERO_VIDEO));

  useEffect(() => {
    if (prefersReducedMotion()) setUseVideo(false);
  }, []);

  /* --- mouse parallax --------------------------------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const layers: { el: HTMLElement | null; depth: number }[] = [
      { el: starsRef.current, depth: 12 },
      { el: plateRef.current, depth: 26 },
      { el: fogRef.current, depth: 46 },
      { el: contentRef.current, depth: -9 },
    ];

    const movers = layers
      .filter((l): l is { el: HTMLElement; depth: number } => Boolean(l.el))
      .map(({ el, depth }) => ({
        depth,
        x: gsap.quickTo(el, "xPercent", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(el, "yPercent", { duration: 1.1, ease: "power3.out" }),
      }));

    const onMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      for (const m of movers) {
        m.x(-nx * m.depth * 0.22);
        m.y(-ny * m.depth * 0.18);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /* --- load-in + scroll pull-back --------------------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /* Slow push-in that never stops — the frame is always breathing. */
      gsap.fromTo(
        plateRef.current,
        { scale: 1.12 },
        {
          scale: 1.24,
          duration: 26,
          ease: "none",
          repeat: -1,
          yoyo: true,
        },
      );

      gsap.fromTo(
        [".hero-fade"],
        { opacity: 0, y: 24, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.4,
          stagger: 0.12,
          delay: 1.05,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        cueRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, delay: 1.8 },
      );

      /* The camera pulls back and the frame defocuses as the page moves on. */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        })
        .to(contentRef.current, { yPercent: -34, opacity: 0, filter: "blur(14px)" }, 0)
        .to(plateRef.current, { yPercent: 14, scale: 1.34 }, 0)
        .to(starsRef.current, { yPercent: 22, opacity: 0.2 }, 0)
        .to(fogRef.current, { yPercent: -8, opacity: 0.95 }, 0)
        .to(cueRef.current, { opacity: 0, duration: 0.2 }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="vignette relative h-[100svh] w-full overflow-hidden"
    >
      {/* Plate 1 — the alpine frame (or a video, if one is configured) */}
      <div
        ref={plateRef}
        className="gpu absolute inset-[-8%] scale-[1.12]"
        aria-hidden="true"
      >
        {useVideo ? (
          <video
            className="h-full w-full object-cover [filter:contrast(1.08)_saturate(0.88)_brightness(0.82)]"
            src={HERO_VIDEO}
            poster={photo("alpineCloudSea", { w: 1920 })}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setUseVideo(false)}
          />
        ) : (
          <Image
            src={photo("alpineCloudSea", { w: 3840 })}
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={88}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover object-[50%_45%]"
          />
        )}
      </div>

      {/* Plate 2 — star field, screen-blended into the sunrise sky. The mask
          stops above the peaks; stars over rock read as dust, not sky. */}
      <div
        ref={starsRef}
        className="gpu absolute inset-[-10%] mix-blend-screen"
        aria-hidden="true"
        style={{
          opacity: useVideo ? 0.18 : 0.5,
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 16%, transparent 36%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 16%, transparent 36%)",
        }}
      >
        <Image
          src={photo("starlitPines", { w: 2400 })}
          alt=""
          fill
          quality={70}
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Plate 3 — atmospheric fog and the bottom-out to page black */}
      <div
        ref={fogRef}
        className="gpu absolute inset-[-6%]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(120% 70% at 18% 88%, rgba(217,185,137,0.10), transparent 58%)," +
            "radial-gradient(90% 60% at 82% 12%, rgba(134,173,196,0.12), transparent 60%)," +
            "linear-gradient(180deg, rgba(4,5,10,0.62) 0%, rgba(4,5,10,0.12) 34%, rgba(4,5,10,0.55) 72%, #04050a 100%)",
        }}
      />

      {/* Plate 4 — type */}
      <div
        ref={contentRef}
        className="gpu relative z-10 mx-auto flex h-full max-w-[92rem] flex-col justify-end px-6 pb-[13svh] sm:px-10 lg:px-16"
      >
        <p className="eyebrow hero-fade mb-7 flex items-center gap-4 text-bone-dim/70">
          <span className="block h-px w-10 bg-champagne/60" />
          <ScrambleText text="Escape Club — Est. MMXIV" delay={620} speed={2} />
        </p>

        <h1 className="sr-only">A little further. A little freer.</h1>

        <div
          aria-hidden="true"
          className="font-display text-[length:var(--text-hero)] leading-[0.88] font-normal tracking-[-0.035em]"
        >
          <SplitHeading
            as="div"
            trigger="load"
            variant="lines"
            delay={0.35}
            className="text-bone"
          >
            A little further.
          </SplitHeading>
          <SplitHeading
            as="div"
            trigger="load"
            variant="lines"
            delay={0.52}
            className="text-champagne-gradient italic"
          >
            A little freer.
          </SplitHeading>
        </div>

        <div className="hero-fade mt-10 flex flex-col gap-8 sm:mt-12 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-mist sm:text-[0.95rem]">
            A private travel club for people who would rather be somewhere
            quieter, higher, and considerably harder to reach. Ninety-seven
            countries. Three hundred guides. No group tours, ever.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <MagneticLink href="/join" variant="solid">
              Request an invitation
            </MagneticLink>
            <MagneticLink href="#story" variant="ghost" strength={8}>
              See the places
            </MagneticLink>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={cueRef}
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <span className="relative block h-12 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.4s_var(--ease-luxe)_infinite] bg-gradient-to-b from-transparent via-champagne to-transparent" />
        </span>
      </div>
    </section>
  );
}
