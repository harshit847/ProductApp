// Centralized environment parsing keeps startup failures obvious and easy to debug.
import path from "node:path";
import dotenv from "dotenv";

// Resolve backend/.env explicitly so the unified server on port 3000 loads the
// right variables regardless of which working directory it is started from.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function parseCsv(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Ensures the DATABASE_URL has sensible defaults for Neon's serverless
 * Postgres without overriding user-supplied values.
 *
 * Neon's transaction-mode pooler (pgbouncer=true) multiplexes many logical
 * connections over fewer TCP sockets.  Prisma's connection_limit controls how
 * many TCP connections Prisma opens to PgBouncer (or directly to Postgres).
 *
 * A connection_limit of 1 is fragile on Neon: if that single TCP socket is
 * recycled by Neon's serverless infrastructure mid-request, ALL pending
 * queries fail with "Error { kind: Closed }".  A limit of 5 provides
 * redundancy so surviving connections carry the load while Prisma replaces
 * the dead one.
 *
 * This function ONLY adds parameters that are missing — it never overrides
 * values the user has explicitly set in their DATABASE_URL.
 */
function tuneDatabaseUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // Neon cold starts can take several seconds — be patient.
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "30");
    }
    // connect_timeout controls how long the TCP handshake may take.
    // 10 s is generous enough for a Neon endpoint resuming from pause.
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "10");
    }
    // connection_limit: default to 5 if the user hasn't set one.
    // Never override an explicit user value.
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
    }
    // Windows local dev can fail TLS negotiation with Neon's strict channel
    // binding setting, so relax it outside production unless the caller has
    // explicitly chosen something else.
    if (process.platform === "win32" && process.env.NODE_ENV !== "production" && url.searchParams.get("channel_binding") === "require") {
      url.searchParams.delete("channel_binding");
    }
    return url.toString();
  } catch {
    // If the URL can't be parsed (e.g. local Postgres), return as-is.
    return raw;
  }
}

const rawDatabaseUrl = required("DATABASE_URL");

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  clientOrigins: parseCsv(process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:3000"),
  databaseUrl: tuneDatabaseUrl(rawDatabaseUrl),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 600,
  authRateLimitPerMinute: Number(process.env.AUTH_RATE_LIMIT_PER_MINUTE) || 20,
  dashboardSummaryCacheTtlMs: Number(process.env.DASHBOARD_SUMMARY_CACHE_TTL_MS) || 15_000
};
