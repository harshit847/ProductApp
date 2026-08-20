// Dashboard service fetches the aggregated stats, activities, and recent leads from the API.
// Falls back to empty data so the UI stays safe even when the backend is unreachable.
import { apiRequest } from "./api";
import type { DashboardSummary } from "@/utils/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}
