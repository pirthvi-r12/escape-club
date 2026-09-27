"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MagneticLink } from "@/components/ui/MagneticLink";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const LINKS = [
  { href: "#story", label: "The idea" },
  { href: "#destinations", label: "Destinations" },
  { href: "#experiences", label: "Experiences" },
  { href: "#members", label: "Members" },
];

export function SiteNav({ user }: { user: SessionUser | null }) {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock the page while the mobile sheet is open. */
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.85, ease: EASE_LUXE }}
        className="fixed inset-x-0 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top,0px))] max-sm:pt-[max(3.25rem,env(safe-area-inset-top,0px))]"
      >
        <div
          className={cn(
            "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            condensed
              ? "glass-deep border-b border-white/8"
              : "border-b border-transparent",
          )}
        >
          <nav
            className={cn(
              "mx-auto flex max-w-[92rem] items-center justify-between px-6 transition-all duration-700 sm:px-10 lg:px-16",
              condensed ? "h-16" : "h-24",
            )}
          >
            <Link
              href="/"
              className="group flex items-baseline gap-2.5 text-bone"
              aria-label="Escape Club home"
            >
              <span className="font-display text-lg tracking-[0.02em]">
                Escape
              </span>
              <span className="text-[0.62rem] font-medium tracking-[0.42em] text-champagne uppercase">
                Club
              </span>
            </Link>

            <div className="hidden items-center gap-10 lg:flex">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative text-[0.78rem] tracking-[0.04em] text-mist transition-colors duration-400 hover:text-bone"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-champagne transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <MagneticLink href="/dashboard" variant="solid" strength={10}>
                  {user.name.split(" ")[0]}&apos;s club
                </MagneticLink>
              ) : (
                <>
                  <MagneticLink
                    href="/join?mode=signin"
                    variant="ghost"
                    strength={8}
                    className="hidden sm:inline-flex"
                  >
                    Sign in
                  </MagneticLink>
                  <MagneticLink href="/join" variant="solid" strength={10}>
                    Apply
                  </MagneticLink>
                </>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-bone lg:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      "absolute left-0 h-px w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      menuOpen ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 h-px w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      menuOpen ? "top-1.5 -rotate-45" : "top-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-deep fixed inset-0 z-40 flex flex-col justify-center px-8 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.08 + i * 0.07,
                    ease: EASE_LUXE,
                  }}
                  className="font-display border-b border-white/8 py-5 text-4xl tracking-[-0.02em] text-bone"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
