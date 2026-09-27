/** Builds DATABASE_URL from DB_* when DATABASE_URL is not set. */
export function mysqlSslQuery(): string {
  const enabled =
    process.env.DB_SSL === "true" ||
    process.env.DB_SSL === "1" ||
    process.env.DB_SSL === "yes";
  if (!enabled) return "";
  return "sslaccept=strict";
}

function appendQueryParams(baseUrl: string, params: string): string {
  if (!params) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${params}`;
}

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
  const auth = password
    ? `${encodeURIComponent(user)}:${password}`
    : encodeURIComponent(user);

  const base = `mysql://${auth}@${host}:${port}/${name}`;
  return appendQueryParams(base, mysqlSslQuery());
}

export function applyDatabaseUrlFromEnv(): string | undefined {
  const url = resolveDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
  return url;
}
