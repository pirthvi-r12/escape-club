"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

import type { DiscoveryDestination } from "@/lib/dashboard-discovery";

export type { DiscoveryDestination };

type Props = {
  destinations: DiscoveryDestination[];
  variant?: "grid" | "compact";
  title?: string;
  subtitle?: string;
};

export function TripDiscoveryPanel({
  destinations,
  variant = "grid",
  title = "Start your roster",
  subtitle = "Add a destination to the list or book a departure — charts, globe, and itinerary will fill in.",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function addTrip(
    slug: string,
    status: "DREAMING" | "BOOKED",
  ) {
    setBusySlug(slug);
    setMessage(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationSlug: slug, status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not add trip.");
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setMessage("Connection failed. Try again.");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <section className="glass glass-sheen overflow-hidden rounded-2xl">
      <div className="border-b border-white/8 p-6 sm:p-8">
        <p className="eyebrow text-[0.6rem]">Discover</p>
        <h2 className="font-display mt-2 text-2xl tracking-[-0.02em] text-bone sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[0.82rem] leading-relaxed text-mist">
          {subtitle}
        </p>
        {message && (
          <p className="mt-4 border-l border-ember pl-3 text-sm text-ember">
            {message}
          </p>
        )}
      </div>

      <div
        className={cn(
          "gap-4 p-6 sm:p-8",
          variant === "grid"
            ? "grid sm:grid-cols-2 xl:grid-cols-4"
            : "flex flex-col",
        )}
      >
        {destinations.map((dest) => {
          const loading = busySlug === dest.slug || pending;
          return (
            <article
              key={dest.slug}
              className={cn(
                "group overflow-hidden rounded-xl border border-white/10 bg-ink-850/50",
                variant === "compact" && "grid sm:grid-cols-[7rem_1fr_auto] sm:items-center",
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden",
                  variant === "grid" ? "aspect-[4/3]" : "aspect-square sm:aspect-auto sm:h-full sm:min-h-[6rem]",
                )}
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width:640px) 100vw, 280px"
                  quality={76}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                {variant === "grid" && (
                  <p className="absolute bottom-3 left-3 text-[0.58rem] tracking-[0.18em] text-champagne uppercase">
                    {dest.region}
                  </p>
                )}
              </div>

              <div className={cn("p-4", variant === "compact" && "sm:py-3")}>
                <h3 className="font-display text-lg leading-none text-bone">
                  {dest.name}
                </h3>
                <p className="mt-1.5 text-[0.72rem] text-mist-dim">
                  {dest.country} · {dest.tagline}
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-wrap gap-2 p-4 pt-0 sm:flex-col sm:pt-4",
                  variant === "compact" && "sm:px-4 sm:py-3",
                )}
              >
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => addTrip(dest.slug, "DREAMING")}
                  className="rounded-full border border-white/15 px-4 py-2 text-[0.62rem] tracking-[0.16em] text-bone uppercase transition-colors hover:border-champagne/50 hover:text-champagne disabled:opacity-50"
                >
                  Add to list
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => addTrip(dest.slug, "BOOKED")}
                  className="rounded-full bg-bone px-4 py-2 text-[0.62rem] tracking-[0.16em] text-ink-950 uppercase transition-colors hover:bg-white disabled:opacity-50"
                >
                  Book dates
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
