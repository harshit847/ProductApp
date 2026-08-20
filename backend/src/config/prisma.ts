// Prisma is the data access layer for the CRM, so we keep the client in one place.
// In development we cache the client on globalThis to avoid creating multiple pools during hot reloads.
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __flowcrmPrisma: PrismaClient | undefined;
}

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    transactionOptions: { timeout: 30_000, maxWait: 15_000 },
    datasources: {
      db: {
        url: env.databaseUrl
      }
    }
  });
}

export let prisma = globalThis.__flowcrmPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__flowcrmPrisma = prisma;
}

// ── Readiness gate ───────────────────────────────────────────────────────────
// The server starts listening immediately (so /health passes), but API routes
// wait for this flag.  Once the startup ping succeeds the gate opens and all
// subsequent requests proceed without delay.

let _dbReady = false;
export function isDbReady() {
  return _dbReady;
}

/**
 * Pings the database with exponential back-off.  Returns once the first query
 * succeeds (setting the readiness gate) or after all retries are exhausted.
 * Does NOT throw — failures are logged and the server keeps running so that
 * /health stays available and a subsequent request can trigger another retry.
 */
export async function waitForDatabase(maxAttempts = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      _dbReady = true;
      console.log("Database connection established");
      return;
    } catch (err) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 10_000); // 1 s, 2 s, 4 s, 8 s, 10 s
      console.warn(`Database ping attempt ${attempt}/${maxAttempts} failed — retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  console.error("Database not reachable after startup pings — API requests will retry on demand");
}

export function isTransientPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1017"].includes(error.code);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return true;
  }

  if (error instanceof Error) {
    return (
      /postgresql connection/i.test(error.message) ||
      /connection.*closed/i.test(error.message) ||
      /closed/i.test(error.message) ||
      /Unable to start a transaction/i.test(error.message) ||
      /transaction.*timeout/i.test(error.message) ||
      /Can't reach database server/i.test(error.message) ||
      /Server has closed the connection/i.test(error.message) ||
      /Connection refused/i.test(error.message)
    );
  }

  return false;
}

export async function resetPrismaClient() {
  const previous = prisma;
  prisma = createClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.__flowcrmPrisma = prisma;
  }

  await previous.$disconnect().catch(() => undefined);
}

export async function withPrismaRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isTransientPrismaConnectionError(error)) {
      await resetPrismaClient();
      // Exponential back-off gives Neon time to resume a paused endpoint or
      // re-establish a dropped pooler connection.  Starts at 300 ms, caps at 3 s.
      const attempt = 4 - retries;
      const delay = Math.min(300 * 2 ** attempt, 3_000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withPrismaRetry(operation, retries - 1);
    }

    throw error;
  }
}
