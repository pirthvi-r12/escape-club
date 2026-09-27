import "server-only";

/**
 * TiDB / MySQL TLS is configured via DATABASE_URL (`sslaccept=strict` for Prisma)
 * and optional DB_SSL=true. Prisma's MySQL driver validates certificates
 * (equivalent to rejectUnauthorized: true).
 */
export const mysqlConnectionOptions = () => {
  const sslEnabled =
    process.env.DB_SSL === "true" ||
    process.env.DB_SSL === "1" ||
    process.env.DB_SSL === "yes" ||
    process.env.DATABASE_URL?.includes("sslaccept=strict");

  return {
    ssl: sslEnabled ? { rejectUnauthorized: true as const } : undefined,
  };
};
