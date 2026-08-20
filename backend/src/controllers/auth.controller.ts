// Auth controller translates HTTP requests into service calls.
// Each handler validates input via Zod and delegates to auth.service for business logic.
import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authSchema, loginSchema, refreshSchema, changePasswordSchema } from "../models/schemas";
import * as authService from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth";

/** POST /auth/signup — registers a new user with SALES role and returns JWT tokens. */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const input = authSchema.parse(req.body);
  const result = await authService.signup({
    name: input.name || "New User",
    email: input.email,
    password: input.password
  });
  res.status(201).json(result);
});

/** POST /auth/login — authenticates a user and returns JWT tokens. */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.json(result);
});

/** POST /auth/refresh — exchanges a valid refresh token for new access + refresh tokens. */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const input = refreshSchema.parse(req.body);
  res.json(await authService.refreshSession(input.refreshToken));
});

/** GET /auth/me — returns the currently authenticated user's profile. */
export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await authService.getProfile(req.user!.userId));
});

/** PATCH /auth/change-password — changes the user's password after verifying the current one. */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  res.json(await authService.changePassword(req.user!.userId, input));
});

