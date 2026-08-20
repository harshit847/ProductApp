// Auth routes are grouped so signup/login/refresh stay discoverable.
// Public routes (signup, login, refresh) have no auth guard.
// Protected routes (me, change-password) require a valid Bearer token.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import * as controller from "../controllers/auth.controller";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authSchema, loginSchema, refreshSchema, changePasswordSchema } from "../models/schemas";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: env.authRateLimitPerMinute,
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes — anyone can sign up, log in, or refresh their token.
router.post("/signup", authLimiter, validate(authSchema), controller.signup);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/refresh", authLimiter, validate(refreshSchema), controller.refresh);

// Protected routes — the user must provide a valid JWT access token.
router.get("/me", authRequired, controller.me);
router.patch("/change-password", authRequired, validate(changePasswordSchema), controller.changePassword);

export default router;

