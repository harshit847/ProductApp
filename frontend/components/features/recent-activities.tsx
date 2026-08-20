import type { Activity } from "@/utils/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "./empty-state";

function activityLabel(type: Activity["type"]): string {
  const labels: Record<string, string> = {
    LEAD_CREATED: "Lead",
    LEAD_UPDATED: "Lead",
    TASK_CREATED: "Task",
    TASK_DONE: "Task",
    PROFILE_UPDATED: "Profile"
  };
  return labels[type] || "System";
}

function activityColor(type: Activity["type"]): string {
  const colors: Record<string, string> = {
    LEAD_CREATED: "border-cyan-200 bg-cyan-50 text-cyan-700",
    LEAD_UPDATED: "border-sky-200 bg-sky-50 text-sky-700",
    TASK_CREATED: "border-amber-200 bg-amber-50 text-amber-700",
    TASK_DONE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PROFILE_UPDATED: "border-violet-200 bg-violet-50 text-violet-700"
  };
  return colors[type] || "border-slate-200 bg-slate-50 text-slate-500";
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Realtime updates across leads, tasks, and settings.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Actions will appear here as the team starts creating leads, tasks, and updates."
          />
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition-all duration-150 hover:bg-slate-100">
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-medium leading-5 text-slate-900">{activity.message}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-slate-500">{formatRelativeTime(activity.createdAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${activityColor(activity.type)}`}>
                  {activityLabel(activity.type)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
