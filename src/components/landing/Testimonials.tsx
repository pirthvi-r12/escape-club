"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { TESTIMONIALS } from "@/lib/content";

/** Glass quote card that tilts subtly toward the cursor. */
function QuoteCard({
  quote,
  name,
  role,
  index,
}: (typeof TESTIMONIALS)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setTilt({
      x: ((event.clientY - (rect.top + rect.height / 2)) / rect.height) * -7,
      y: ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 7,
    });
  };

  return (
    <Reveal delay={index * 0.1}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.6 }}
        style={{ transformStyle: "preserve-3d", perspective: 900 }}
        className="glass glass-sheen flex h-full flex-col justify-between rounded-sm p-8 sm:p-10"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="mb-8 h-5 w-5 text-champagne/70"
        >
          <path
            d="M10 5c-3.9 1.6-6 4.6-6 8.6 0 3 1.7 5.4 4.3 5.4 2 0 3.5-1.5 3.5-3.5 0-1.9-1.3-3.3-3.2-3.3-.3 0-.6 0-.8.1.4-2 1.9-3.6 4.1-4.6L10 5Zm9.6 0c-3.9 1.6-6 4.6-6 8.6 0 3 1.7 5.4 4.3 5.4 2 0 3.5-1.5 3.5-3.5 0-1.9-1.3-3.3-3.2-3.3-.3 0-.6 0-.8.1.4-2 1.9-3.6 4.1-4.6L19.6 5Z"
            fill="currentColor"
          />
        </svg>

        <blockquote className="font-display text-xl leading-[1.35] tracking-[-0.015em] text-bone sm:text-[1.45rem]">
          {quote}
        </blockquote>

        <footer className="mt-10 border-t border-white/10 pt-5">
          <p className="text-sm text-bone">{name}</p>
          <p className="mt-1 text-[0.7rem] tracking-[0.16em] text-mist-dim uppercase">
            {role}
          </p>
        </footer>
      </motion.div>
    </Reveal>
  );
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[92rem] px-6 py-[16svh] sm:px-10 lg:px-16">
      <header className="mb-16">
        <p className="eyebrow mb-8 flex items-center gap-4">
          <span className="block h-px w-10 bg-champagne/50" />
          From the roster
        </p>
        <SplitHeading
          as="h2"
          className="font-display max-w-2xl text-[length:var(--text-display)] leading-[1.02] tracking-[-0.03em] text-bone"
        >
          People who are difficult to impress.
        </SplitHeading>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <QuoteCard key={t.name} {...t} index={i} />
        ))}
      </div>
    </section>
  );
}
