/** Hostnames that should never appear in production admin analytics. */
const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "::1",
]);

export function getPageHost(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

export function isLocalDevHost(host = getPageHost()): boolean {
  const value = (host || "").trim().toLowerCase();
  if (!value) return false;
  if (LOCAL_HOSTS.has(value)) return true;
  return value.endsWith(".local");
}

export function isLocalAnalyticsRow(row: {
  host?: string | null;
  origin_host?: string | null;
}): boolean {
  return isLocalDevHost(row.host || row.origin_host || "");
}
