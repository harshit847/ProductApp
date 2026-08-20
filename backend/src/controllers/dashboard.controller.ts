// Dashboard controller returns summarized data for cards and charts.
// The aggregation happens in a single database call via Promise.all for performance.
import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { getDashboardSummary } from "../services/dashboard.service";

/** GET /dashboard/summary — returns lead counts, task counts, recent activities, and recent leads. */
export const summary = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getDashboardSummary());
});

