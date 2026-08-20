// Lead controller keeps the HTTP layer thin and readable.
// It parses query parameters and request bodies, then delegates to lead.service.
import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/errors";
import { LEAD_STATUSES, leadSchema } from "../models/schemas";
import * as leadService from "../services/lead.service";
import { z } from "zod";

const leadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  query: z.string().optional(),
  status: z.enum(LEAD_STATUSES).optional()
});

/** GET /leads — returns a paginated list of leads, with optional search and status filter. */
export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const parsed = leadQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid lead query", 400);
  }
  res.json(await leadService.listLeads(parsed.data));
});

/** POST /leads — creates a new lead after validating the request body. */
export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const input = leadSchema.parse(req.body);
  res.status(201).json(await leadService.createLead(input));
});

/** PUT /leads/:id — updates an existing lead by ID. */
export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const input = leadSchema.partial().parse(req.body);
  res.json(await leadService.updateLead(String(req.params.id), input));
});

/** DELETE /leads/:id — permanently removes a lead from the database. */
export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  res.json(await leadService.deleteLead(String(req.params.id)));
});

