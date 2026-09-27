"use client";

import { useEffect, useRef } from "react";

import { MANIFESTO } from "@/lib/content";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

/**
 * Editorial statement whose words illuminate one by one as the section moves
 * through the viewport. Scrubbed rather than triggered, so the reader controls
 * the pace of the sentence.
 */
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const copy = copyRef.current;
    if (!section || !copy) return;

    if (prefersReducedMotion()) {
      copy.style.opacity = "1";
      return;
    }

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !copyRef.current) return;

      split = new SplitText(copy, { type: "words" });
      copy.style.opacity = "1";

      gsap.set(split.words, { opacity: 0.11 });

      tween = gsap.to(split.words, {
        opacity: 1,
        ease: "none",
        stagger: 0.55,
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          end: "bottom 62%",
          scrub: 0.5,
        },
      });
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto max-w-[92rem] px-6 py-[22svh] sm:px-10 lg:px-16"
    >
      <p className="eyebrow mb-14 flex items-center gap-4">
        <span className="block h-px w-10 bg-champagne/50" />
        The premise
      </p>

      <p
        ref={copyRef}
        style={{ opacity: 0 }}
        className="font-display max-w-5xl text-[length:var(--text-display)] leading-[1.14] tracking-[-0.025em] text-bone"
      >
        {MANIFESTO}
      </p>

      <div className="mt-20 grid gap-10 border-t border-white/8 pt-10 sm:grid-cols-3">
        {[
          ["No itineraries you did not ask for", "Every day is built around one member, once."],
          ["Guides, not reps", "Three hundred specialists on retainer. All of them locals."],
          ["A hard ceiling on members", "We cap the roster so the good windows stay uncrowded."],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="mb-3 text-[0.95rem] leading-snug text-bone">{title}</h3>
            <p className="text-sm leading-relaxed text-mist-dim">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
