// Dashboard aggregation keeps the frontend stat cards and charts easy to drive.
// We use Promise.all to run all database queries in parallel for fast response times.
// The summary carries every aggregate the dashboard and analytics pages need, so the
// frontend never has to download full lead/task lists just to render breakdown charts.
import type { LeadStatus, TaskStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma, withPrismaRetry } from "../config/prisma";

const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const SUMMARY_CACHE_TTL_MS = env.dashboardSummaryCacheTtlMs;

type DashboardSummaryValue = Awaited<ReturnType<typeof getDashboardSummaryFresh>>;
type SummaryCache = { value: DashboardSummaryValue; expiresAt: number };

let summaryCache: SummaryCache | null = null;

export function invalidateDashboardSummaryCache() {
  summaryCache = null;
}

async function getDashboardSummaryFresh() {
  return withPrismaRetry(async () => {
    const [leadCount, wonLeads, openLeads, valueAgg, taskCount, doneTasks, activities, recentLeads, topLeads, stageGroups, valueStageGroups, taskGroups] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "WON" } }),
        prisma.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
        prisma.lead.aggregate({ _sum: { value: true } }),
        prisma.task.count(),
        prisma.task.count({ where: { status: "DONE" } }),
        prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.lead.findMany({
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: { owner: { select: { name: true } } }
        }),
        prisma.lead.findMany({
          orderBy: { value: "desc" },
          take: 5,
          include: { owner: { select: { name: true } } }
        }),
        prisma.lead.groupBy({
          by: ["status"],
          _count: { status: true }
        }),
        prisma.lead.groupBy({
          by: ["status"],
          _sum: { value: true }
        }),
        prisma.task.groupBy({
          by: ["status"],
          _count: { status: true }
        })
      ]);

    const leadStageCounts = stageGroups.reduce(
      (acc, group) => {
        acc[group.status] = group._count.status;
        return acc;
      },
      LEAD_STATUSES.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<LeadStatus, number>)
    );

    const taskStatusCounts = taskGroups.reduce(
      (acc, group) => {
        acc[group.status] = group._count.status;
        return acc;
      },
      TASK_STATUSES.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<TaskStatus, number>)
    );

    const valueByStage = valueStageGroups.reduce(
      (acc, group) => {
        acc[group.status] = group._sum.value ?? 0;
        return acc;
      },
      LEAD_STATUSES.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<LeadStatus, number>)
    );

    return {
      stats: {
        totalLeads: leadCount,
        closedWon: wonLeads,
        openLeads,
        totalValue: valueAgg._sum.value ?? 0,
        totalTasks: taskCount,
        completedTasks: doneTasks
      },
      recentActivities: activities,
      recentLeads,
      topLeads,
      leadStageCounts,
      taskStatusCounts,
      valueByStage
    };
  });
}

export async function getDashboardSummary() {
  if (summaryCache && summaryCache.expiresAt > Date.now()) {
    return summaryCache.value;
  }

  const value = await getDashboardSummaryFresh();
  summaryCache = { value, expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS };
  return value;
}
