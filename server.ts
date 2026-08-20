// Unified single-port server.
// Runs the Next.js frontend AND the Express API on the same HTTP server (port 3000),
// so the entire application is reachable from http://localhost:3000 only.
//   - /api/* and /health are handled by the Express app
//   - everything else is handled by Next.js (pages, assets, HMR websocket in dev)
import path from "node:path";
import { createServer } from "node:http";
import next from "next";
import { createApp } from "./backend/src/app";
import { prisma, waitForDatabase } from "./backend/src/config/prisma";
import { getDashboardSummary } from "./backend/src/services/dashboard.service";

const isProd = process.argv.includes("--prod") || process.env.NODE_ENV === "production";

// The unified server always defaults to port 3000. It reads APP_PORT (not PORT)
// so the backend's standalone PORT value in backend/.env can never hijack it.
const port = Number(process.env.APP_PORT || 3000);

const nextApp = next({ dev: !isProd, dir: path.join(__dirname, "frontend") });
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare();

  const expressApp = createApp();

  const server = createServer((req, res) => {
    const url = req.url || "/";

    // Express owns the API surface; Next owns everything else.
    if (url.startsWith("/api") || url.startsWith("/health")) {
      expressApp(req, res);
      return;
    }

    void handle(req, res);
  });

  // In development Next's hot-reload client connects over a websocket on this
  // same port. Forward upgrade requests to Next's internal upgrade handler.
  if (!isProd) {
    const upgrade = (nextApp as unknown as { getUpgradeHandler: () => (req: unknown, socket: unknown, head: unknown) => Promise<unknown> }).getUpgradeHandler();
    server.on("upgrade", (req, socket, head) => {
      void upgrade(req, socket, head);
    });
  }

  server.listen(port, () => {
    console.log(`HR CRM ready at http://localhost:${port} (frontend + API on one port)`);
    if (!isProd) console.log("Development mode: Next.js HMR and Express API share this port.");

    // Database warm-up: ping the DB in the background, then eagerly fill the
    // dashboard cache.  This runs after the server is listening so health
    // checks pass immediately, but API requests are gated by isDbReady().
    waitForDatabase().then(() => {
      getDashboardSummary().catch(() => undefined);
    }).catch(() => undefined);

    // Keep the serverless Postgres connection warm in production only.
    // In development we skip the ping so an unavailable or paused DB does not
    // spam the console or make local UI work feel broken.
    if (isProd) {
      const keepalive = setInterval(() => {
        void prisma.$queryRaw`SELECT 1`.catch(() => undefined);
      }, 30_000);
      keepalive.unref?.();
    }
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down HR CRM...`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("Failed to start HR CRM", error);
  process.exit(1);
});


