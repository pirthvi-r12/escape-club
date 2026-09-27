import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DatabaseSetupPanel } from "@/components/system/DatabaseSetupPanel";
import { getDatabaseStatus } from "@/lib/db";

export const metadata: Metadata = {
  title: "Database setup",
  robots: { index: false },
};

export default async function DatabaseSetupPage() {
  const status = await getDatabaseStatus();
  if (status === "ready") redirect("/join");

  return (
    <main className="bg-ink-950">
      <DatabaseSetupPanel />
    </main>
  );
}
