// Profile service handles user profile reads, updates, and password changes.
// These are kept separate from auth.service so the domain boundary stays clear.
import { prisma, withPrismaRetry } from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError } from "../utils/errors";
import { invalidateDashboardSummaryCache } from "./dashboard.service";

/** Fetch a user's public profile by their ID. Excludes sensitive fields like passwordHash. */
export async function getProfile(userId: string) {
  return withPrismaRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  });
}

/** Update a user's profile fields (name, phone, department, avatar). */
export async function updateProfile(userId: string, input: { name?: string; phone?: string; department?: string; avatarUrl?: string }) {
  return withPrismaRetry(async () => {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          department: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true
        }
      });

      await tx.activityLog.create({
        data: {
          type: "PROFILE_UPDATED",
          message: `Profile updated for ${user.name}`,
          userId: user.id
        }
      });

      return user;
    });

    invalidateDashboardSummaryCache();
    return updated;
  });
}

/** Change a user's password after verifying the current password. */
export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  return withPrismaRetry(async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Current password is incorrect", 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(input.newPassword) }
    });

    return { message: "Password updated successfully" };
  });
}
