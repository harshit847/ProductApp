// Shared UI and API types keep the frontend pages simple and easy to explain.
// These mirror the Prisma schema enums so frontend and backend stay in sync.
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type ActivityType = "LEAD_CREATED" | "LEAD_UPDATED" | "TASK_CREATED" | "TASK_DONE" | "PROFILE_UPDATED";

/** Stat card shape used on the dashboard summary row. */
export type StatCard = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
};

/** Owner reference — may be a string (from local state) or an object (from the API). */
export type OwnerRef = string | { id: string; name: string; email: string };

/** Lead record as returned by the API. */
export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  value: number;
  notes?: string;
  ownerId?: string;
  owner?: OwnerRef;
  updatedAt: string;
  createdAt?: string;
};

/** Task record as returned by the API. */
export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: LeadPriority;
  dueDate?: string;
  completedAt?: string;
  assigneeId?: string;
  assignee?: OwnerRef;
  completed?: boolean;
  updatedAt?: string;
};

/** Activity log entry from the API. */
export type Activity = {
  id: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  userId?: string;
  leadId?: string;
};

/** API paginated response for leads. */
export type PaginatedLeads = {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
};

/** Dashboard summary response from the API. */
export type DashboardSummary = {
  stats: {
    totalLeads: number;
    closedWon: number;
    openLeads: number;
    totalValue: number;
    totalTasks: number;
    completedTasks: number;
  };
  recentActivities: Activity[];
  recentLeads: Lead[];
  topLeads: Lead[];
  leadStageCounts: Record<LeadStatus, number>;
  taskStatusCounts: Record<TaskStatus, number>;
  valueByStage: Record<LeadStatus, number>;
};

/** Helper to extract a display name from an OwnerRef (string or object). */
export function resolveOwnerName(owner?: OwnerRef): string {
  if (!owner) return "Unassigned";
  if (typeof owner === "string") return owner;
  return owner.name || "Unassigned";
}
