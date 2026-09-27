import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  /* Middleware already blocked anonymous requests; this covers a valid token
     whose user no longer exists. */
  if (!user) redirect("/join?mode=signin");

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
