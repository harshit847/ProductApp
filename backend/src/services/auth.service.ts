// Auth service owns signup, login, refresh, and password changes.
// Transactions are only used where atomicity is critical (signup, changePassword).
// Login and refresh use sequential queries since failure mid-operation is safe.
import crypto from "crypto";
import { prisma, withPrismaRetry } from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/errors";
import type { JwtUser } from "../models";

function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildTokens(payload: JwtUser) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

/** Registers a new user — transaction needed for email uniqueness + create + token store. */
export async function signup(input: { name: string; email: string; password: string }) {
  return withPrismaRetry(async () => {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new AppError("Email already in use", 409);
      }

      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: "SALES",
          passwordHash: await hashPassword(input.password)
        }
      });

      const payload: JwtUser = { userId: user.id, role: user.role, email: user.email };
      const tokens = buildTokens(payload);

      await tx.user.update({ where: { id: user.id }, data: { refreshToken: hashRefreshToken(tokens.refreshToken) } });

      return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens };
    });
  });
}

/** Authenticates a user — no transaction needed, failure mid-operation is safe. */
export async function login(input: { email: string; password: string }) {
  return withPrismaRetry(async () => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401);
    }

    const payload: JwtUser = { userId: user.id, role: user.role, email: user.email };
    const tokens = buildTokens(payload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashRefreshToken(tokens.refreshToken) } });

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens };
  });
}

/** Refreshes a session — no transaction needed, failure mid-operation is safe. */
export async function refreshSession(refreshToken: string) {
  return withPrismaRetry(async () => {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== hashRefreshToken(refreshToken)) {
      throw new AppError("Session expired", 401);
    }

    const payload: JwtUser = { userId: user.id, role: user.role, email: user.email };
    const tokens = buildTokens(payload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashRefreshToken(tokens.refreshToken) } });
    return tokens;
  });
}

/** Fetches a user's public profile — read-only, no transaction needed. */
export async function getProfile(userId: string) {
  return withPrismaRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, department: true, avatarUrl: true, isActive: true, createdAt: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  });
}

/** Updates a user's profile fields — single write, no transaction needed. */
export async function updateProfile(userId: string, input: { name?: string; phone?: string; department?: string; avatarUrl?: string }) {
  return withPrismaRetry(async () => {
    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: { id: true, name: true, email: true, role: true, phone: true, department: true, avatarUrl: true, isActive: true, createdAt: true }
    });
  });
}

/** Changes a user's password — transaction needed for find + verify + update atomicity. */
export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  return withPrismaRetry(async () => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const valid = await comparePassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new AppError("Current password is incorrect", 400);
      }

      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(input.newPassword) }
      });

      return { message: "Password updated successfully" };
    });
  });
}
