"use client";

import Link from "next/link";
import { useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type MagneticLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** How far the button drifts toward the cursor, in pixels. */
  strength?: number;
  variant?: "solid" | "outline" | "ghost";
};

const VARIANTS: Record<NonNullable<MagneticLinkProps["variant"]>, string> = {
  solid:
    "bg-bone text-ink-950 hover:bg-white border border-transparent",
  outline:
    "border border-white/20 text-bone hover:border-champagne/70 hover:text-champagne-soft",
  ghost: "text-mist hover:text-bone",
};

/**
 * Cursor-following button. The transform is written by GSAP with quickTo, so
 * the motion is off the React render path entirely.
 */
export function MagneticLink({
  href,
  children,
  className,
  strength = 14,
  variant = "outline",
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const moveX = useRef<gsap.QuickToFunc | null>(null);
  const moveY = useRef<gsap.QuickToFunc | null>(null);

  const ensureQuickTo = () => {
    if (!ref.current || moveX.current) return;
    moveX.current = gsap.quickTo(ref.current, "x", {
      duration: 0.5,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(ref.current, "y", {
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion()) return;
    ensureQuickTo();
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    moveX.current?.(relX * strength);
    moveY.current?.(relY * strength);
  };

  const handleLeave = () => {
    ensureQuickTo();
    moveX.current?.(0);
    moveY.current?.(0);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "gpu group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5",
        "text-[0.7rem] font-medium tracking-[0.22em] uppercase",
        "transition-colors duration-500",
        VARIANTS[variant],
        className,
      )}
    >
      <span>{children}</span>
      <svg
        viewBox="0 0 14 14"
        aria-hidden="true"
        className="h-2.5 w-2.5 -translate-x-0.5 transition-transform duration-500 ease-out group-hover:translate-x-0.5"
      >
        <path
          d="M1 7h11M7.5 2.5 12 7l-4.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
