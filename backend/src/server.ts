// Server entry point — starts the Express app on the configured port.
// The createApp() function from app.ts sets up all middleware and routes.
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma, waitForDatabase } from "./config/prisma";
import { getDashboardSummary } from "./services/dashboard.service";

const app = createApp();

async function start() {
  // Ping the database in the background while the server starts accepting
  // traffic.  API routes are gated by isDbReady() so early requests get a
  // clean 503 instead of cascading Prisma errors.
  waitForDatabase().then(() => {
    // Once the DB is confirmed reachable, eagerly warm the dashboard cache
    // so the first user request is served from memory.
    getDashboardSummary().catch(() => undefined);
  }).catch(() => undefined);

  const server = app.listen(env.port, () => {
    console.log(`HR CRM API running on port ${env.port}`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, closing HR CRM API...`);
    server.close(() => {
      void prisma.$disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      void prisma.$disconnect();
      process.exit(1);
    }, 5000).unref();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start HR CRM API", error);
  process.exit(1);
});


