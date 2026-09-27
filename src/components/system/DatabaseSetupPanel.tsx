import Link from "next/link";

type Props = {
  variant?: "page" | "inline";
};

export function DatabaseSetupPanel({ variant = "page" }: Props) {
  const shell =
    variant === "page"
      ? "mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center px-6 py-16"
      : "rounded-2xl border border-white/10 bg-ink-900/80 p-8";

  return (
    <div className={shell}>
      <p className="eyebrow mb-3 text-champagne/80">Database</p>
      <h1 className="font-display text-3xl tracking-tight text-bone">
        PostgreSQL is not running
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mist-dim">
        Your app is configured to use{" "}
        <span className="text-mist">localhost:5432</span>, but nothing is
        listening there yet. That is why Prisma shows &ldquo;Can&apos;t reach
        database server&rdquo; — not a bug in your code.
      </p>

      <ol className="mt-8 space-y-4 text-sm text-mist">
        <li className="flex gap-3">
          <span className="font-mono text-champagne">1</span>
          <span>
            Install{" "}
            <strong className="font-normal text-bone">Docker Desktop</strong>{" "}
            and run{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs">
              npm run db:setup
            </code>
            , or install PostgreSQL 17+ locally.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-champagne">2</span>
          <span>
            Apply schema:{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs">
              npm run db:apply-sql
            </code>{" "}
            then seed:{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs">
              npm run db:seed
            </code>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-champagne">3</span>
          <span>
            Confirm health at{" "}
            <Link href="/api/health/db" className="text-champagne underline">
              /api/health/db
            </Link>{" "}
            — should return <code className="text-xs">ok: true</code>.
          </span>
        </li>
      </ol>

      <p className="mt-8 text-xs text-mist-dim">
        Windows without Docker:{" "}
        <code className="text-mist">winget install PostgreSQL.PostgreSQL.17</code>
        , create database <code className="text-mist">escape_club</code>, keep{" "}
        <code className="text-mist">DATABASE_URL</code> in{" "}
        <code className="text-mist">.env</code>, then run the SQL + seed commands
        above.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-full border border-white/15 px-6 py-3 text-xs tracking-widest text-bone uppercase"
        >
          Back home
        </Link>
        <Link
          href="/join"
          className="rounded-full bg-bone px-6 py-3 text-xs tracking-widest text-ink-950 uppercase"
        >
          Membership
        </Link>
      </div>
    </div>
  );
}
