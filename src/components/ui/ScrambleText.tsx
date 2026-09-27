"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*—·";

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Milliseconds before the decode starts. */
  delay?: number;
  /** Frames each character stays scrambled before it locks in. */
  speed?: number;
};

/**
 * Resolves text out of random glyphs, one character at a time. Runs on a
 * single rAF loop and writes straight to textContent.
 */
export function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 2,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = text;
      return;
    }

    let frame = 0;
    let rafId = 0;
    let timeoutId = 0;
    const settleAt = text.split("").map((_, i) => i * speed + 4);

    const tick = () => {
      let out = "";
      let done = true;

      for (let i = 0; i < text.length; i += 1) {
        if (frame >= settleAt[i]) {
          out += text[i];
        } else {
          done = false;
          out += text[i] === " "
            ? " "
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      el.textContent = out;
      frame += 1;

      if (!done) rafId = requestAnimationFrame(tick);
    };

    el.textContent = "";
    timeoutId = window.setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [text, delay, speed]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text}
    </span>
  );
}
