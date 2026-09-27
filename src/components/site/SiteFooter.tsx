import Link from "next/link";

import { Marquee } from "@/components/ui/Marquee";
import { DESTINATIONS } from "@/lib/content";

const COLUMNS = [
  {
    title: "Club",
    links: [
      { label: "The premise", href: "#story" },
      { label: "Destinations", href: "#destinations" },
      { label: "Experiences", href: "#experiences" },
      { label: "Members", href: "#members" },
    ],
  },
  {
    title: "Membership",
    links: [
      { label: "Apply", href: "/join" },
      { label: "Member sign in", href: "/join?mode=signin" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Nominate a guest", href: "/join" },
    ],
  },
  {
    title: "Practical",
    links: [
      { label: "Insurance & cover", href: "#" },
      { label: "Cancellation policy", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-ink-950">
      <Marquee
        items={DESTINATIONS.map((d) => `${d.name} · ${d.country}`)}
        speed={44}
        className="border-b border-white/8 py-6"
      />

      <div className="mx-auto max-w-[92rem] px-6 pt-20 pb-10 sm:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl tracking-[0.01em] text-bone">
                Escape
              </span>
              <span className="text-[0.62rem] font-medium tracking-[0.42em] text-champagne uppercase">
                Club
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist-dim">
              A little further. A little freer. Founded 2014, Chamonix — now
              operating in ninety-seven countries.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title}>
              <p className="eyebrow mb-6">{col.title}</p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-mist transition-colors duration-400 hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.7rem] tracking-[0.16em] text-mist-dim uppercase">
            © {new Date().getFullYear()} Escape Club
          </p>
          <p className="text-[0.7rem] tracking-[0.16em] text-mist-dim uppercase">
            Photography courtesy of Unsplash contributors
          </p>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none overflow-hidden px-6 sm:px-10 lg:px-16"
      >
        <p className="font-display translate-y-[22%] text-center text-[19vw] leading-none tracking-[-0.05em] text-white/[0.035] select-none">
          ESCAPE CLUB
        </p>
      </div>
    </footer>
  );
}
