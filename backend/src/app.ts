// Express app composition is intentionally simple so deployment stays easy.
// Each middleware and route mount is added in order - helmet for security, CORS for cross-origin
// requests, JSON parsing, request logging, rate limiting, and finally the route handlers.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { isDbReady } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import leadRoutes from "./routes/lead.routes";
import taskRoutes from "./routes/task.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import profileRoutes from "./routes/profile.routes";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  // Security and middleware - applied in order before any routes.
  app.set("trust proxy", 1);
  app.use(helmet());

  // CORS pre-check: rejected origins now return a clean 403 JSON body instead of
  // a generic 500 from the error callback, making CORS failures debuggable.
  app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (origin && !env.clientOrigins.includes(origin)) {
      return res.status(403).json({ message: "Origin not allowed by CORS" });
    }
    next();
  });
  app.use(cors({ origin: env.clientOrigins, credentials: true }));

  app.use(express.json({ limit: "1mb" }));
  // Request logging: verbose "dev" output locally, standard "combined" for production ops.
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  // Global rate limit is generous enough for normal CRM usage but still blocks abuse.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: env.rateLimitPerMinute,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // Health check endpoint - always available so load balancers and Render/EC2
  // health checks pass even while the database is still connecting.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "hr-crm-api", db: isDbReady() ? "connected" : "connecting" });
  });

  // API route mounts - each domain has its own route file.
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/profile", profileRoutes);

  // Error handling - not-found catches unmatched routes, errorHandler catches everything else.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
