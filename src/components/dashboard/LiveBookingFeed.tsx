"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { EASE_LUXE } from "@/lib/motion";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { FeedItem, Tier } from "@/types";

const TIER_DOT: Record<Tier, string> = {
  EXPLORER: "bg-mist-dim",
  VOYAGER: "bg-glacier",
  OBSIDIAN: "bg-champagne",
};

const POLL_MS = 5000;
const VISIBLE = 7;

/**
 * Platform-wide booking activity. Polls rather than holding a socket open:
 * at a five-second cadence the payload is tiny, it survives serverless cold
 * starts, and it pauses itself when the tab is hidden.
 */
export function LiveBookingFeed({ initial }: { initial: FeedItem[] }) {
  const [events, setEvents] = useState<FeedItem[]>(initial.slice(0, VISIBLE));
  const [live, setLive] = useState(true);
  /* Re-render on a slow tick so the "12s ago" labels stay honest. */
  const [, setClock] = useState(0);
  const seen = useRef(new Set(initial.map((e) => e.id)));

  useEffect(() => {
    let cancelled = false;
    let timer: number;

    const poll = async () => {
      if (document.visibilityState === "hidden") {
        timer = window.setTimeout(poll, POLL_MS);
        return;
      }

      try {
        const res = await fetch(`/api/feed?limit=${VISIBLE}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const { events: next } = (await res.json()) as { events: FeedItem[] };
          if (!cancelled) {
            setEvents(next.slice(0, VISIBLE));
            next.forEach((e) => seen.current.add(e.id));
            setLive(true);
          }
        }
      } catch {
        if (!cancelled) setLive(false);
      }

      if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
    };

    timer = window.setTimeout(poll, POLL_MS);
    const clock = window.setInterval(() => setClock((c) => c + 1), 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, []);

  return (
    <article className="glass glass-sheen flex h-full flex-col rounded-2xl p-6">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[0.92rem] text-bone">Booked just now</h2>
        <span className="flex items-center gap-2 text-[0.62rem] tracking-[0.18em] text-mist-dim uppercase">
          <span className="relative flex h-1.5 w-1.5">
            {live && (
              <span className="absolute inset-0 animate-ping rounded-full bg-champagne/70" />
            )}
            <span
              className={`relative h-1.5 w-1.5 rounded-full ${
                live ? "bg-champagne" : "bg-mist-dim"
              }`}
            />
          </span>
          {live ? "Live" : "Reconnecting"}
        </span>
      </header>

      <ul className="-mx-2 flex-1 space-y-0.5">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.li
              key={event.id}
              layout
              initial={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: EASE_LUXE }}
              className="flex items-center gap-3.5 rounded-lg px-2 py-2.5 transition-colors duration-300 hover:bg-white/[0.035]"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  TIER_DOT[event.memberTier]
                }`}
                title={event.memberTier}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] text-bone">
                  {event.memberName}
                  <span className="text-mist-dim"> booked </span>
                  {event.destination}
                </p>
                <p className="text-[0.68rem] text-mist-dim">
                  {event.country} · {timeAgo(event.createdAt)}
                </p>
              </div>

              <p className="shrink-0 text-[0.75rem] text-champagne tabular-nums">
                {formatCurrency(event.amount)}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <footer className="mt-5 border-t border-white/8 pt-4">
        <p className="text-[0.68rem] leading-relaxed text-mist-dim">
          Names are abbreviated. Amounts are the deposit, not the total.
        </p>
      </footer>
    </article>
  );
}
