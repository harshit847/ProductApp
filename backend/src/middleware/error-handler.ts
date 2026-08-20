// Central error handler keeps failures clean and interview-friendly.
// Express recognises error handlers by their 4-parameter signature (err, req, res, next).
// We handle three cases: custom AppErrors, Prisma unique constraint violations (P2002),
// and unexpected internal errors.
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { isTransientPrismaConnectionError } from "../config/prisma";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Custom AppError - thrown by services when a business rule is violated.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Prisma transient connection errors - the database is temporarily unreachable.
  if (isTransientPrismaConnectionError(err)) {
    return res.status(503).json({ message: "Database temporarily unavailable. Please try again." });
  }

  // Prisma P2002 - unique constraint violation (e.g. duplicate email).
  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }

  // Fallback - log the error server-side and return a generic 500.
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ message });
}
