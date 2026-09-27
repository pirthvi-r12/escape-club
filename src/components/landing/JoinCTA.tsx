"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { MagneticLink } from "@/components/ui/MagneticLink";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BLUR_DATA_URL, photo } from "@/lib/images";

export function JoinCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        plateRef.current,
        { yPercent: -12, scale: 1.16 },
        {
          yPercent: 8,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="vignette relative flex min-h-[94svh] items-center overflow-hidden"
    >
      <div ref={plateRef} className="gpu absolute inset-[-14%]" aria-hidden="true">
        <Image
          src={photo("starlitPeaks", { w: 2880 })}
          alt=""
          fill
          quality={82}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
      </div>

      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, #2e2910 0%, rgba(46,41,16,0.45) 22%, rgba(46,41,16,0.5) 62%, #2e2910 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[92rem] px-6 sm:px-10 lg:px-16">
        <p className="eyebrow mb-8 flex items-center gap-4">
          <span className="block h-px w-10 bg-champagne/50" />
          Membership
        </p>

        <SplitHeading
          as="h2"
          className="font-display max-w-4xl text-[length:var(--text-mega)] leading-[0.92] tracking-[-0.035em] text-bone"
        >
          The roster opens twice a year.
        </SplitHeading>

        <Reveal delay={0.2} className="mt-10 max-w-lg">
          <p className="text-[0.95rem] leading-relaxed text-mist">
            Two hundred places, released in January and July. Applications are
            read by a person, answered within ten days, and occasionally
            declined. Existing members may nominate one guest each year.
          </p>
        </Reveal>

        <Reveal delay={0.3} className="mt-12">
          <div className="flex flex-wrap items-center gap-3">
            <MagneticLink href="/join" variant="solid">
              Request an invitation
            </MagneticLink>
            <MagneticLink href="/join?mode=signin" variant="outline">
              Member sign in
            </MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
