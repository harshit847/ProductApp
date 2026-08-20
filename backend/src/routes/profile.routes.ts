// Profile routes keep user settings separate from auth credentials.
// Each route validates input through the validate middleware before hitting the controller.
import { Router } from "express";
import * as controller from "../controllers/profile.controller";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { profileSchema, changePasswordSchema } from "../models/schemas";

const router = Router();

// Profile routes require authentication — users can only manage their own profile.
router.get("/me", authRequired, controller.getMe);
router.patch("/me", authRequired, validate(profileSchema), controller.updateMe);
router.patch("/me/password", authRequired, validate(changePasswordSchema), controller.updatePassword);

export default router;

