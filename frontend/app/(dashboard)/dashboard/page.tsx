"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { StatCards } from "@/components/features/stat-cards";
import { DashboardSkeleton } from "@/components/features/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { useCrmData } from "@/hooks/use-crm-data";
import type { DashboardSummary, LeadStatus, StatCard, TaskStatus, ActivityType } from "@/utils/types";

const leadStages: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
const taskStages: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const activityTypes: ActivityType[] = ["LEAD_CREATED", "LEAD_UPDATED", "TASK_CREATED", "TASK_DONE", "PROFILE_UPDATED"];

const defaultLeadCounts: Record<LeadStatus, number> = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, WON: 0, LOST: 0 };
const defaultTaskCounts: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };

const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost"
};

const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

const activityLabels: Record<ActivityType, string> = {
  LEAD_CREATED: "Lead created",
  LEAD_UPDATED: "Lead updated",
  TASK_CREATED: "Task created",
  TASK_DONE: "Task completed",
  PROFILE_UPDATED: "Profile updated"
};

const leadColors: Record<LeadStatus, string> = {
  NEW: "#38bdf8",
  CONTACTED: "#8b5cf6",
  QUALIFIED: "#f59e0b",
  PROPOSAL: "#06b6d4",
  WON: "#10b981",
  LOST: "#f43f5e"
};

const taskColors: Record<TaskStatus, string> = {
  TODO: "#38bdf8",
  IN_PROGRESS: "#8b5cf6",
  DONE: "#10b981"
};

const activityColors: Record<ActivityType, string> = {
  LEAD_CREATED: "#06b6d4",
  LEAD_UPDATED: "#8b5cf6",
  TASK_CREATED: "#f59e0b",
  TASK_DONE: "#10b981",
  PROFILE_UPDATED: "#ec4899"
};

const tooltipStyle = {
  background: "rgba(255,255,255,0.98)",
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: 8,
  boxShadow: "0 12px 32px rgba(16,24,40,0.12)",
  padding: "8px 12px",
  fontSize: 12
} as const;

function mapStats(raw: DashboardSummary["stats"]): StatCard[] {
  const openTasks = Math.max(raw.totalTasks - raw.completedTasks, 0);
  const taskCompletion = raw.totalTasks > 0 ? Math.round((raw.completedTasks / raw.totalTasks) * 100) : 0;
  const winRate = raw.totalLeads > 0 ? Math.round((raw.closedWon / raw.totalLeads) * 100) : 0;

  return [
    { label: "Total Leads", value: String(raw.totalLeads), change: `${winRate}% win rate`, trend: raw.closedWon > 0 ? "up" : "neutral" },
    { label: "Closed Won", value: String(raw.closedWon), change: `${winRate}% of pipeline closed`, trend: raw.closedWon > 0 ? "up" : "neutral" },
    { label: "Open Tasks", value: String(openTasks), change: `${taskCompletion}% completed`, trend: openTasks > 0 ? "down" : "up" },
    { label: "Completed Tasks", value: String(raw.completedTasks), change: `${taskCompletion}% task completion`, trend: taskCompletion >= 50 ? "up" : "neutral" }
  ];
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const { summary, summaryError } = useCrmData();

  const statCards = summary ? mapStats(summary.stats) : null;
  const leadCounts = summary?.leadStageCounts || defaultLeadCounts;
  const taskCounts = summary?.taskStatusCounts || defaultTaskCounts;

  const activityCounts = useMemo(() => {
    const counts: Record<ActivityType, number> = {
      LEAD_CREATED: 0,
      LEAD_UPDATED: 0,
      TASK_CREATED: 0,
      TASK_DONE: 0,
      PROFILE_UPDATED: 0
    };
    for (const activity of summary?.recentActivities || []) counts[activity.type] += 1;
    return counts;
  }, [summary?.recentActivities]);

  const topLeads = summary?.topLeads || [];
  const recentActivities = summary?.recentActivities || [];

  const completedTasks = summary?.stats.completedTasks || 0;
  const totalTasks = summary?.stats.totalTasks || 0;
  const totalLeads = summary?.stats.totalLeads || 0;
  const closedWon = summary?.stats.closedWon || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const winRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;

  const activeDealCount = useMemo(
    () => leadStages.reduce((sum, status) => (status !== "WON" && status !== "LOST" ? sum + leadCounts[status] : sum), 0),
    [leadCounts]
  );

  const topStage = useMemo(
    () => leadStages.reduce((best, status) => (leadCounts[status] > leadCounts[best] ? status : best), leadStages[0]),
    [leadCounts]
  );
  const topStageCount = leadCounts[topStage];

  const leadChartData = leadStages.map((status) => ({ name: leadStatusLabels[status], value: leadCounts[status], fill: leadColors[status] }));
  const taskChartData = taskStages.map((status) => ({ name: taskStatusLabels[status], value: taskCounts[status], fill: taskColors[status] }));
  const activityChartData = activityTypes.map((type) => ({ name: activityLabels[type], value: activityCounts[type], fill: activityColors[type] }));

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
      }),
    []
  );

  if (!summary && summaryError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="max-w-md px-6 text-center">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Dashboard data could not be loaded</p>
          <p className="mt-1 text-[0.8125rem] text-slate-500 dark:text-muted-foreground">{summaryError}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">A live view of your pipeline, tasks, and workspace activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-muted-foreground">{todayLabel}</span>
        </div>
      </header>

      {statCards ? <StatCards stats={statCards} /> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card xl:col-span-2 dark:border-white/[0.07]">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Pipeline performance</h2>
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Lead distribution across every stage.</p>
            </div>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">{activeDealCount} open leads</Badge>
          </div>

          <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="relative mx-auto h-[19rem] w-full max-w-[21rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#64748b", marginBottom: 4, fontSize: 12 }}
                    itemStyle={{ color: "#0f172a", fontSize: 13, fontWeight: 500 }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Pie
                    data={leadChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={3}
                    cornerRadius={8}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.9)"
                    isAnimationActive={false}
                  >
                    {leadChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">{totalLeads}</span>
                <span className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-muted-foreground">Total leads</span>
              </div>
            </div>

            <div className="space-y-1">
              {leadChartData.map((entry) => {
                const share = totalLeads > 0 ? Math.round((entry.value / totalLeads) * 100) : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="flex-1 text-[0.8125rem] font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                    <span className="text-[0.8125rem] font-semibold tabular-nums text-slate-900 dark:text-foreground">{entry.value}</span>
                    <span className="w-10 text-right text-[0.75rem] tabular-nums text-slate-400 dark:text-muted-foreground">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <div>
            <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Key metrics</h2>
            <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Health of the current pipeline.</p>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-white/[0.06]">
            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">Win rate</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{winRate}%</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${winRate}%` }} />
              </div>
              <p className="mt-2 text-[0.75rem] text-slate-500 dark:text-muted-foreground">{closedWon} of {totalLeads} leads closed won.</p>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">Top stage</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-foreground">{leadStatusLabels[topStage]}</p>
              </div>
              <p className="mt-2 text-[0.75rem] text-slate-500 dark:text-muted-foreground">{topStageCount} leads currently in the largest stage.</p>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">Lead concentration</p>
                <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">
                  {totalLeads > 0 ? Math.round((topStageCount / totalLeads) * 100) : 0}%
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${totalLeads > 0 ? Math.round((topStageCount / totalLeads) * 100) : 0}%` }} />
              </div>
              <p className="mt-2 text-[0.75rem] text-slate-500 dark:text-muted-foreground">Share of all CRM leads in the top stage.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Top opportunities</h2>
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Highest value leads in your pipeline.</p>
            </div>
            <span className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">{topLeads.length} leads</span>
          </div>
          <div className="mt-4 h-[21rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLeads.map((lead) => ({ name: lead.name, value: lead.value }))} layout="vertical" margin={{ top: 8, right: 44, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="opportunityGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.16)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} width={104} fontSize={12} />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} contentStyle={tooltipStyle} formatter={(value) => [formatMoney(Number(value)), "Value"]} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false} fill="url(#opportunityGradient)">
                  <LabelList dataKey="value" position="right" formatter={(value: number) => `$${value / 1000}k`} style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Recent activity</h2>
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Latest events across the workspace.</p>
            </div>
            <span className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">{recentActivities.length} events</span>
          </div>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-white/[0.06]">
            {recentActivities.length === 0 ? (
              <p className="py-8 text-center text-[0.8125rem] text-slate-500 dark:text-muted-foreground">No activity has been recorded yet.</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activityColors[activity.type] }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{activity.message}</p>
                    <p className="text-[0.6875rem] text-slate-500 dark:text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">{activityLabels[activity.type]}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Workload balance</h2>
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Task status breakdown.</p>
            </div>
            <span className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">{totalTasks} tasks</span>
          </div>
          <div className="mt-4 space-y-4">
            {taskStages.map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: taskColors[status] }} />
                    <p className="text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{taskStatusLabels[status]}</p>
                  </div>
                  <span className="text-[0.8125rem] font-semibold tabular-nums text-slate-900 dark:text-foreground">{taskCounts[status]}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${totalTasks > 0 ? Math.round((taskCounts[status] / totalTasks) * 100) : 0}%`, backgroundColor: taskColors[status] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">Engagement trends</h2>
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Activity mix by type.</p>
            </div>
            <span className="text-[0.8125rem] font-medium text-slate-500 dark:text-muted-foreground">{recentActivities.length} events</span>
          </div>
          <div className="mt-4 space-y-4">
            {activityChartData.map((item) => {
              const maxActivity = Math.max(...activityChartData.map((a) => a.value || 1));
              const width = maxActivity > 0 ? Math.round((item.value / maxActivity) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <p className="text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{item.name}</p>
                    </div>
                    <span className="text-[0.8125rem] font-semibold tabular-nums text-slate-900 dark:text-foreground">{item.value}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: item.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
