"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Single registration point. Importing GSAP plugins more than once is
 * harmless, but registering them in one module keeps tree-shaking predictable
 * and guarantees the plugins exist before any component builds a timeline.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  gsap.defaults({ ease: "power3.out", duration: 1 });

  /* Mobile browsers fire resize when the URL bar collapses; ignoring it stops
     every pinned section from recalculating mid-scroll. */
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText };
