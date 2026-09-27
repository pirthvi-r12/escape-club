/** Builds DATABASE_URL from DB_* when DATABASE_URL is not set. */
export function mysqlSslQuery(): string {
  const enabled =
    process.env.DB_SSL === "true" ||
    process.env.DB_SSL === "1" ||
    process.env.DB_SSL === "yes";
  if (!enabled) return "";
  /* Prisma MySQL / TiDB Cloud: verify server TLS certificate */
  return "sslaccept=strict";
}

function appendQueryParams(baseUrl: string, params: string): string {
  if (!params) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${params}`;
}

/** Builds DATABASE_URL from DB_* when DATABASE_URL is not set. */
export function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL?.trim()) {
    const url = process.env.DATABASE_URL.trim();
    const ssl = mysqlSslQuery();
    if (ssl && !url.includes("sslaccept=")) {
      return appendQueryParams(url, ssl);
    }
    return url;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const name = process.env.DB_NAME;
  if (!host || !user || !name) return undefined;

  const port = process.env.DB_PORT ?? "3306";
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "");
  const auth = password ? `${encodeURIComponent(user)}:${password}` : encodeURIComponent(user);

  const base = `mysql://${auth}@${host}:${port}/${name}`;
  const ssl = mysqlSslQuery();
  return appendQueryParams(base, ssl);
}

export function applyDatabaseUrlFromEnv(): string | undefined {
  const url = resolveDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
  return url;
}

export function isMysqlDatabaseUrl(url = process.env.DATABASE_URL): boolean {
  return Boolean(url?.startsWith("mysql://"));
}

export function isCloudDatabaseHost(host = process.env.DB_HOST): boolean {
  return Boolean(host && !["127.0.0.1", "localhost"].includes(host));
}
