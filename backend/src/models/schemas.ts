// Zod schemas make the API safer without adding ceremony to controllers.
// Each schema maps directly to a request body shape — they're used both for
// inline validation in controllers and as middleware via the validate() helper.
import { z } from "zod";

/**
 * Public user registration schema — name is optional so callers without a name
 * still pass validation.  The `role` field is intentionally excluded: public
 * signup always produces a SALES user.  Privileged roles (ADMIN, MANAGER) can
 * only be assigned by an existing admin through an internal endpoint.
 */
export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2).optional()
});

/** Login schema — only needs email and password. */
export const loginSchema = authSchema.pick({ email: true, password: true });

/** Shared enum constants — used for schema validation and query-param filtering. */
export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
export const LEAD_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

/** Lead creation/update schema — all fields the frontend can send when creating or editing a lead. */
export const leadSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().min(2),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  notes: z.string().optional(),
  address: z.string().optional(),
  value: z.number().int().nonnegative(),
  ownerId: z.string().optional()
});

/** Task creation/update schema — matches the Prisma Task model fields. */
export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional()
});

/** Profile update schema — only updatable user fields. */
export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().url().optional()
});

/** Password change schema — requires both current and new password. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

/** Refresh token schema — used by the POST /auth/refresh endpoint. */
export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
