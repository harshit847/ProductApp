// Validation middleware keeps route handlers focused on business logic.
import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return next(new AppError(parsed.error.issues[0]?.message || "Validation failed", 400));
  }
  req.body = parsed.data;
  return next();
};

