"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { EASE_IN_OUT, EASE_LUXE } from "@/lib/motion";

const SESSION_KEY = "ec-curtain-shown";

/**
 * Opening curtain: a counter ticks to 100, then two panels part vertically.
 * Shown once per browser session — a loader you have already watched stops
 * being an effect and becomes an obstacle.
 */
export function Curtain() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    const started = performance.now();
    const DURATION = 1150;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / DURATION);
      /* easeOutExpo so the number decelerates into place */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => setVisible(false), 260);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100]"
          exit={{ pointerEvents: "none" }}
          aria-hidden="true"
        >
          {(["top", "bottom"] as const).map((half) => (
            <motion.div
              key={half}
              className="absolute inset-x-0 h-1/2 bg-ink-950"
              style={half === "top" ? { top: 0 } : { bottom: 0 }}
              initial={{ y: 0 }}
              exit={{ y: half === "top" ? "-100%" : "100%" }}
              transition={{ duration: 1.05, ease: EASE_IN_OUT }}
            />
          ))}

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_LUXE }}
              className="eyebrow"
            >
              Escape Club
            </motion.p>
            <p className="font-display text-6xl leading-none tracking-[-0.03em] text-bone tabular-nums">
              {String(progress).padStart(3, "0")}
            </p>
            <span className="block h-px w-40 overflow-hidden bg-white/12">
              <span
                className="block h-px bg-champagne transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
