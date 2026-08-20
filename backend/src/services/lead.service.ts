// Lead service keeps the CRM's core sales workflow in one place.
// All database interactions go through Prisma, which gives us type safety and easy migrations.
import { prisma, withPrismaRetry } from "../config/prisma";
import { AppError } from "../utils/errors";
import { invalidateDashboardSummaryCache } from "./dashboard.service";

/**
 * Fetch a paginated list of leads with optional search and status filtering.
 * The query parameter searches across name, company, and email fields (case-insensitive).
 */
export async function listLeads(params: { query?: string; status?: string; page?: number; limit?: number }) {
  return withPrismaRetry(async () => {
    // Clamp page and limit to safe ranges to prevent abuse. The frontend keeps a
    // single client-side list, so we allow a generous page size to make sure the
    // shared store and the pipeline board see every lead.
    const page = Number.isFinite(params.page ?? NaN) ? Math.max(1, Math.floor(params.page as number)) : 1;
    const limit = Number.isFinite(params.limit ?? NaN) ? Math.max(1, Math.min(1000, Math.floor(params.limit as number))) : 1000;

    // Build the Prisma where clause dynamically based on query params.
    const where = {
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.query
        ? {
            OR: [
              { name: { contains: params.query, mode: "insensitive" as const } },
              { company: { contains: params.query, mode: "insensitive" as const } },
              { email: { contains: params.query, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { owner: { select: { id: true, name: true, email: true } } }
      }),
      prisma.lead.count({ where })
    ]);

    return { data, page, limit, total };
  });
}

/** Create a new lead and log the creation in the activity feed. */
export async function createLead(input: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes?: string;
  address?: string;
  value: number;
  ownerId?: string;
}) {
  return withPrismaRetry(async () => {
    const lead = await prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: {
          ...input,
          timeline: [{ type: "created", at: new Date().toISOString(), note: "Lead created" }]
        }
      });

      await tx.activityLog.create({
        data: { type: "LEAD_CREATED", message: `Lead created for ${created.name}`, leadId: created.id, metadata: { company: created.company } }
      });

      return created;
    });

    invalidateDashboardSummaryCache();
    return lead;
  });
}

/** Update an existing lead by ID. Logs the update in the activity feed. */
export async function updateLead(id: string, input: Partial<Record<string, unknown>>) {
  return withPrismaRetry(async () => {
    const updated = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id } });
      if (!lead) {
        throw new AppError("Lead not found", 404);
      }

      const result = await tx.lead.update({
        where: { id },
        data: input
      });

      await tx.activityLog.create({
        data: { type: "LEAD_UPDATED", message: `Lead updated for ${result.name}`, leadId: result.id }
      });

      return result;
    });

    invalidateDashboardSummaryCache();
    return updated;
  });
}

/** Delete a lead by ID. Throws 404 if the lead does not exist. */
export async function deleteLead(id: string) {
  return withPrismaRetry(async () => {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    await prisma.lead.delete({ where: { id } });
    invalidateDashboardSummaryCache();
    return { message: "Lead deleted successfully" };
  });
}
