"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  IconGlobe,
  IconOverview,
  IconRoute,
  IconSignOut,
  IconTrips,
} from "@/components/ui/Icon";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: IconOverview },
  { href: "/dashboard/globe", label: "The world map", Icon: IconGlobe },
  { href: "/dashboard/itinerary", label: "Itinerary studio", Icon: IconRoute },
  { href: "/dashboard/trips", label: "All trips", Icon: IconTrips },
];

const TIER_COPY: Record<SessionUser["tier"], string> = {
  EXPLORER: "Explorer",
  VOYAGER: "Voyager",
  OBSIDIAN: "Obsidian",
};

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: SessionUser;
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  };

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex h-full flex-col p-6">
      <Link
        href="/"
        className="mb-12 flex items-baseline gap-2.5"
        onClick={onNavigate}
      >
        <span className="font-display text-lg text-bone">Escape</span>
        <span className="text-[0.58rem] font-medium tracking-[0.42em] text-champagne uppercase">
          Club
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-[0.82rem] transition-colors duration-300",
                active ? "text-bone" : "text-mist hover:text-bone-dim",
              )}
            >
              {active && (
                <motion.span
                  layoutId="dash-nav-active"
                  className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <Icon
                className={cn(
                  "relative transition-colors duration-300",
                  active ? "text-champagne" : "text-mist-dim",
                )}
              />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-10">
        <div className="glass glass-sheen rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne/15 text-[0.7rem] font-medium tracking-wider text-champagne">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] text-bone">{user.name}</p>
              <p className="text-[0.62rem] tracking-[0.2em] text-champagne uppercase">
                {TIER_COPY[user.tier]}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3.5 rounded-lg px-3.5 py-3 text-[0.82rem] text-mist-dim transition-colors duration-300 hover:text-bone disabled:opacity-50"
        >
          <IconSignOut />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-[100svh] bg-ink-950">
      {/* Ambient wash so the glass has something to refract */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 55% at 12% 0%, rgba(134,173,196,0.10), transparent 60%)," +
            "radial-gradient(60% 50% at 92% 8%, rgba(217,185,137,0.09), transparent 62%)",
        }}
      />

      {/* Desktop sidebar */}
      <aside className="glass-deep fixed top-0 left-0 z-30 hidden h-[100svh] w-[17.5rem] border-r border-white/8 lg:block">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile bar */}
      <header className="glass-deep sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 px-5 lg:hidden">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-base text-bone">Escape</span>
          <span className="text-[0.55rem] font-medium tracking-[0.4em] text-champagne uppercase">
            Club
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-bone"
        >
          <span className="space-y-1">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
              className="glass-deep fixed top-0 left-0 z-50 h-[100svh] w-[17.5rem] border-r border-white/8 lg:hidden"
            >
              <SidebarContent
                user={user}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 lg:pl-[17.5rem]">
        <div className="mx-auto max-w-[96rem] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
