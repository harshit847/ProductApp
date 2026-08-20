// Lead service keeps the list screen and forms focused on UI concerns.
// Each function maps directly to a REST endpoint on the Express backend.
import { apiRequest } from "./api";
import type { Lead, PaginatedLeads } from "@/utils/types";

export type LeadFormValues = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  owner?: string;
  ownerId?: string;
  value: number;
  notes?: string;
};

/** Fetch a paginated list of leads, optionally filtered by search query and status. */
export function getLeads(params?: { query?: string; status?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.query) searchParams.set("query", params.query);
  if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params?.limit ?? 1000));
  const qs = searchParams.toString();
  return apiRequest<PaginatedLeads>(`/leads${qs ? `?${qs}` : ""}`);
}

/** Create a new lead via the API. */
export async function createLead(data: LeadFormValues) {
  return apiRequest<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
}

/** Update an existing lead by ID. */
export async function updateLead(id: string, data: Partial<LeadFormValues>) {
  return apiRequest<Lead>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** Delete a lead by ID from the API. */
export async function deleteLead(id: string) {
  return apiRequest<{ message: string }>(`/leads/${id}`, { method: "DELETE" });
}
