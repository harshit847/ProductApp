// A 404 handler makes the API response shape predictable.
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found", 404));
}

