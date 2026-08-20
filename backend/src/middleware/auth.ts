// Auth middleware protects private routes and exposes the signed-in user to handlers.
// It extracts the Bearer token from the Authorization header, verifies it with the
// JWT access secret, and attaches the decoded user object to req.user.
import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/errors";
import { JwtUser } from "../models";

/** Extended request type that includes the decoded JWT user payload. */
export type AuthenticatedRequest = Request & { user?: JwtUser };

/**
 * Middleware that checks for a valid Bearer token in the Authorization header.
 * If the token is missing or invalid, it calls next() with a 401 AppError.
 * If valid, it attaches the decoded user to req.user and calls next().
 */
export function authRequired(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    req.user = verifyAccessToken(header.replace("Bearer ", ""));
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}

