// Task service powers the kanban board, task creation, updates, and deletion.
// Each function interacts with Prisma to perform CRUD operations on the Task model.
import { prisma, withPrismaRetry } from "../config/prisma";
import { AppError } from "../utils/errors";
import { invalidateDashboardSummaryCache } from "./dashboard.service";

/** Fetch all tasks ordered by most recently updated, including assignee info. */
export async function listTasks() {
  return withPrismaRetry(async () => {
    return prisma.task.findMany({
      orderBy: { updatedAt: "desc" },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
  });
}

/** Create a new task and log the creation in the activity feed. */
export async function createTask(input: {
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeId?: string;
}) {
  return withPrismaRetry(async () => {
    const task = await prisma.$transaction(async (tx) => {
      const created = await tx.task.create({
        data: {
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          completedAt: input.status === "DONE" ? new Date() : null
        }
      });

      await tx.activityLog.create({
        data: { type: "TASK_CREATED", message: `Task created: ${created.title}`, metadata: { taskId: created.id } }
      });

      return created;
    });

    invalidateDashboardSummaryCache();
    return task;
  });
}

/** Update an existing task by ID. Automatically sets completedAt when status changes to DONE. */
export async function updateTask(id: string, input: Partial<Record<string, unknown>>) {
  return withPrismaRetry(async () => {
    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      const { dueDate, status, ...rest } = input as {
        dueDate?: string;
        status?: "TODO" | "IN_PROGRESS" | "DONE";
        [key: string]: unknown;
      };

      const result = await tx.task.update({
        where: { id },
        data: {
          ...rest,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
          ...(status ? { status } : {}),
          ...(status === "DONE" ? { completedAt: new Date() } : {})
        }
      });

      if (status === "DONE") {
        await tx.activityLog.create({
          data: { type: "TASK_DONE", message: `Task completed: ${result.title}`, metadata: { taskId: result.id } }
        });
      }

      return result;
    });

    invalidateDashboardSummaryCache();
    return updated;
  });
}

/** Mark a task as complete - a shortcut that sets status + completedAt in one call. */
export async function markTaskComplete(id: string) {
  return withPrismaRetry(async () => {
    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      const result = await tx.task.update({
        where: { id },
        data: { status: "DONE", completedAt: new Date() },
        include: { assignee: { select: { id: true, name: true, email: true } } }
      });

      await tx.activityLog.create({
        data: { type: "TASK_DONE", message: `Task completed: ${result.title}`, metadata: { taskId: result.id } }
      });

      return result;
    });

    invalidateDashboardSummaryCache();
    return updated;
  });
}

/** Delete a task by ID. Throws 404 if the task does not exist. */
export async function deleteTask(id: string) {
  return withPrismaRetry(async () => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    await prisma.task.delete({ where: { id } });
    invalidateDashboardSummaryCache();
    return { message: "Task deleted successfully" };
  });
}
