// Profile controller isolates user settings flows from the auth routes.
// Each handler extracts the userId from the JWT and delegates to profile.service.
import { Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest } from "../middleware/auth";
import { profileSchema, changePasswordSchema } from "../models/schemas";
import { getProfile, updateProfile, changePassword } from "../services/profile.service";

/** GET /profile/me — returns the authenticated user's profile data. */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json(await getProfile(req.user!.userId));
});

/** PATCH /profile/me — updates the user's profile fields (name, phone, department, avatar). */
export const updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = profileSchema.parse(req.body);
  res.json(await updateProfile(req.user!.userId, input));
});

/** PATCH /profile/me/password — changes the user's password after verifying the current one. */
export const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  res.json(await changePassword(req.user!.userId, input));
});

