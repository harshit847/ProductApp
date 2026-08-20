// Task controller exposes the kanban actions used by the frontend.
import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { taskSchema } from "../models/schemas";
import * as taskService from "../services/task.service";

/** GET /tasks — returns all tasks for the current user's kanban board. */
export const listTasks = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await taskService.listTasks());
});

/** POST /tasks — creates a new task after validating the input with Zod. */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const input = taskSchema.parse(req.body);
  res.status(201).json(await taskService.createTask(input));
});

/** PUT /tasks/:id — updates an existing task. The body is validated as a partial schema. */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const input = taskSchema.partial().parse(req.body);
  res.json(await taskService.updateTask(String(req.params.id), input));
});

/** PATCH /tasks/:id/complete — marks a task as done in one step. */
export const completeTask = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.markTaskComplete(String(req.params.id)));
});

/** DELETE /tasks/:id — removes a task permanently from the database. */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.deleteTask(String(req.params.id)));
});

