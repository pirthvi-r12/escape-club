"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { EASE_LUXE } from "@/lib/motion";

const ACTIONS = [
  {
    href: "/dashboard/itinerary",
    label: "Itinerary studio",
    detail: "Rebuild or drag the plan",
  },
  {
    href: "/dashboard/globe",
    label: "World map",
    detail: "Rotate every marker",
  },
  {
    href: "/dashboard/trips",
    label: "Trip archive",
    detail: "Full departure history",
  },
  {
    href: "/join",
    label: "Nominate a guest",
    detail: "One invitation per year",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ACTIONS.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: i * 0.06, ease: EASE_LUXE }}
        >
          <Link
            href={action.href}
            className="glass glass-sheen group flex h-full flex-col rounded-2xl p-5 transition-colors duration-500 hover:border-champagne/35"
          >
            <span className="eyebrow text-[0.56rem] text-champagne/85">
              {action.label}
            </span>
            <p className="mt-3 text-[0.82rem] leading-snug text-bone-dim transition-colors duration-300 group-hover:text-bone">
              {action.detail}
            </p>
            <span className="mt-auto pt-5 text-[0.62rem] tracking-[0.2em] text-mist-dim uppercase transition-colors duration-300 group-hover:text-champagne">
              Open →
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
