"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Mode = "signin" | "apply";

const FIELD =
  "peer w-full border-b border-white/15 bg-transparent px-0 pt-6 pb-2.5 text-[0.95rem] text-bone " +
  "outline-none transition-colors duration-400 placeholder:text-transparent focus:border-champagne";

const LABEL =
  "pointer-events-none absolute left-0 top-6 origin-left text-sm text-mist-dim " +
  "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-champagne " +
  "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]";

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        placeholder={label}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className={FIELD}
      />
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
    </div>
  );
}

export function AuthPanel({
  initialMode,
  nextPath,
  databaseReady,
  databaseConfigured = true,
}: {
  initialMode: Mode;
  nextPath: string;
  databaseReady: boolean;
  databaseConfigured?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const busy = pending || submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "signin"
        ? {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          }
        : {
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          };

    try {
      const res = await fetch(
        mode === "signin" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      startTransition(() => {
        router.replace(nextPath);
        router.refresh();
      });
    } catch {
      setError("Could not reach the club. Check your connection.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-16 inline-flex items-baseline gap-2.5 text-bone"
      >
        <span className="font-display text-xl">Escape</span>
        <span className="text-[0.6rem] font-medium tracking-[0.42em] text-champagne uppercase">
          Club
        </span>
      </Link>

      <div className="mb-10 flex gap-1 rounded-full border border-white/10 p-1">
        {(
          [
            ["signin", "Sign in"],
            ["apply", "Apply"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
            }}
            className={cn(
              "relative flex-1 rounded-full px-4 py-2.5 text-[0.7rem] font-medium tracking-[0.2em] uppercase transition-colors duration-400",
              mode === value ? "text-ink-950" : "text-mist hover:text-bone",
            )}
          >
            {mode === value && (
              <motion.span
                layoutId="auth-toggle"
                className="absolute inset-0 rounded-full bg-bone"
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: EASE_LUXE }}
        >
          <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.025em] text-bone sm:text-5xl">
            {mode === "signin" ? "Welcome back." : "Tell us who you are."}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-mist">
            {mode === "signin"
              ? "Your dashboard, your globe, and everything still on the list."
              : "Applications are read by a person and answered within ten days. Two hundred places open in January and July."}
          </p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            {mode === "apply" && (
              <Field id="name" label="Full name" autoComplete="name" />
            )}
            <Field
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />

            {mode === "apply" && (
              <p className="text-xs leading-relaxed text-mist-dim">
                Minimum eight characters. We store a bcrypt hash and nothing
                else.
              </p>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="border-l border-ember pl-4 text-sm text-ember"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy}
              className={cn(
                "group relative w-full overflow-hidden rounded-full bg-bone px-8 py-4",
                "text-[0.7rem] font-medium tracking-[0.22em] text-ink-950 uppercase",
                "transition-all duration-500 hover:bg-white",
                "disabled:cursor-wait disabled:opacity-60",
              )}
            >
              {busy
                ? "One moment…"
                : mode === "signin"
                  ? "Enter the club"
                  : "Submit application"}
            </button>
          </form>

          {!databaseReady && (
            <p className="mt-8 border-l border-ember/80 pl-4 text-xs leading-relaxed text-mist-dim">
              {databaseConfigured ? (
                <>
                  PostgreSQL is configured but not running on{" "}
                  <span className="text-mist">localhost:5432</span>. Start it
                  with{" "}
                  <span className="text-mist">npm run db:setup</span> (Docker)
                  or install PostgreSQL locally, then{" "}
                  <span className="text-mist">npm run db:apply-sql</span> and{" "}
                  <span className="text-mist">npm run db:seed</span>.{" "}
                  <Link href="/setup/database" className="text-champagne underline">
                    Full setup guide
                  </Link>
                </>
              ) : (
                <>
                  Sign-in requires PostgreSQL. Set{" "}
                  <span className="text-mist">DATABASE_URL</span> in{" "}
                  <span className="text-mist">.env</span>, then run{" "}
                  <span className="text-mist">npm run db:setup</span>.
                </>
              )}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
