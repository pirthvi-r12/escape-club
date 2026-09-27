import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth/AuthPanel";
import { getSessionUser, isDatabaseReady, isDatabaseConfiguredForAuth } from "@/lib/auth";
import { BLUR_DATA_URL, photo } from "@/lib/images";

export const metadata: Metadata = {
  title: "Membership",
  description: "Sign in, or apply to the Escape Club roster.",
};

type SearchParams = Promise<{ mode?: string; next?: string }>;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { mode, next } = await searchParams;
  const databaseReachable = await isDatabaseReady();
  const databaseConfigured = isDatabaseConfiguredForAuth();

  if (await getSessionUser()) {
    redirect("/dashboard");
  }

  /* Only allow in-app destinations through, never an absolute URL. */
  const nextPath = next?.startsWith("/") ? next : "/dashboard";

  return (
    <main className="flex min-h-[100svh] flex-col lg:flex-row">
      {/* Plate */}
      <div className="vignette relative h-[34svh] w-full overflow-hidden lg:h-auto lg:w-[52%]">
        <Image
          src={photo("moonlitRidge", { w: 2400 })}
          alt="Annapurna under moonlight"
          fill
          priority
          quality={84}
          sizes="(max-width: 1024px) 100vw, 52vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-ink-950/50 lg:bg-gradient-to-r lg:from-ink-950/20 lg:via-ink-950/10 lg:to-ink-950" />

        <div className="absolute inset-x-6 bottom-8 z-10 sm:inset-x-10 lg:inset-x-16 lg:bottom-16">
          <p className="eyebrow mb-4 flex items-center gap-4">
            <span className="block h-px w-10 bg-champagne/60" />
            Annapurna · Nepal
          </p>
          <p className="font-display max-w-md text-2xl leading-[1.15] tracking-[-0.02em] text-bone sm:text-3xl">
            A little further. A little freer.
          </p>
        </div>
      </div>

      {/* Panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12 lg:px-16">
        <AuthPanel
          initialMode={mode === "signin" ? "signin" : "apply"}
          nextPath={nextPath}
          databaseReady={databaseReachable}
          databaseConfigured={databaseConfigured}
        />
      </div>
    </main>
  );
}
