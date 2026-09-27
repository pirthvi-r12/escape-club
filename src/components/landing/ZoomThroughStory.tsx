"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { STORY_CHAPTERS } from "@/lib/content";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BLUR_DATA_URL, photo } from "@/lib/images";

/**
 * The centrepiece. A sticky stage held for four screens of scroll: each
 * chapter's word rushes out of the distance, passes through the camera and
 * blows out, while the plate behind it crossfades and settles from a push-in.
 *
 * CSS `position: sticky` does the pinning instead of ScrollTrigger's pin so
 * there is no pin-spacer for Lenis to fight, and only transform/opacity are
 * ever animated.
 */
export function ZoomThroughStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const plates = plateRefs.current.filter(Boolean) as HTMLDivElement[];
      const words = wordRefs.current.filter(Boolean) as HTMLDivElement[];
      const captions = captionRefs.current.filter(
        Boolean,
      ) as HTMLParagraphElement[];

      /* First chapter starts visible; the rest wait their turn. */
      gsap.set(plates.slice(1), { autoAlpha: 0 });
      gsap.set(words, { autoAlpha: 0, scale: 0.22 });
      gsap.set(captions, { autoAlpha: 0, y: 14 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
        },
      });

      STORY_CHAPTERS.forEach((_, i) => {
        const at = i;

        /* Plate: crossfade in, then relax out of a slow push-in. */
        if (i > 0) {
          tl.to(plates[i], { autoAlpha: 1, duration: 0.3 }, at - 0.18);
          tl.to(plates[i - 1], { autoAlpha: 0, duration: 0.3 }, at - 0.18);
        }
        tl.fromTo(
          plates[i],
          { scale: 1.26 },
          { scale: 1.04, duration: 1.15 },
          at - 0.18,
        );

        /* Word: rushes in from far away... */
        tl.fromTo(
          words[i],
          { scale: 0.22, autoAlpha: 0, filter: "blur(9px)" },
          {
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.44,
            ease: "power2.out",
          },
          at,
        );
        /* ...then straight past the lens. */
        tl.to(
          words[i],
          {
            scale: 8.5,
            autoAlpha: 0,
            filter: "blur(7px)",
            duration: 0.48,
            ease: "power2.in",
          },
          at + 0.52,
        );

        tl.to(captions[i], { autoAlpha: 1, y: 0, duration: 0.22 }, at + 0.12);
        tl.to(captions[i], { autoAlpha: 0, duration: 0.2 }, at + 0.66);
      });

      /* Hairline progress bar across the whole sequence. */
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative"
      style={{ height: `${STORY_CHAPTERS.length * 120}svh` }}
    >
      <div className="vignette sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Plates */}
        {STORY_CHAPTERS.map((chapter, i) => (
          <div
            key={chapter.word}
            ref={(el) => {
              plateRefs.current[i] = el;
            }}
            className="gpu absolute inset-0"
            aria-hidden="true"
          >
            <Image
              src={photo(chapter.photoKey, { w: 2880 })}
              alt=""
              fill
              quality={82}
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink-950/45" />
          </div>
        ))}

        {/* Words rushing through the lens */}
        <div className="absolute inset-0 flex items-center justify-center">
          {STORY_CHAPTERS.map((chapter, i) => (
            <div
              key={chapter.word}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="gpu absolute font-display text-[length:var(--text-mega)] leading-none font-normal tracking-[-0.04em] text-bone select-none [text-shadow:0_2px_40px_rgba(4,5,10,0.55)]"
            >
              {chapter.word}
            </div>
          ))}
        </div>

        {/* Captions, held low in the frame so the word owns the centre */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[16svh]">
          {STORY_CHAPTERS.map((chapter, i) => (
            <p
              key={chapter.word}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className="gpu absolute max-w-md px-6 text-center text-sm leading-relaxed text-bone-dim"
            >
              <span className="eyebrow mb-3 block text-champagne/80">
                {String(i + 1).padStart(2, "0")} / {String(STORY_CHAPTERS.length).padStart(2, "0")}
              </span>
              {chapter.caption}
            </p>
          ))}
        </div>

        {/* Progress */}
        <div className="absolute inset-x-6 bottom-6 z-10 sm:inset-x-10 lg:inset-x-16">
          <span className="block h-px w-full bg-white/10">
            <span
              ref={progressRef}
              className="block h-px w-full origin-left bg-champagne"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
