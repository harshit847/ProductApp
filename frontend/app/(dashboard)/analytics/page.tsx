"use client";

import { Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrmData } from "@/hooks/use-crm-data";
import type { LeadStatus, TaskStatus } from "@/utils/types";
import { EmptyState } from "@/components/features/empty-state";
import { PageHeader } from "@/components/layout/page-header";

const leadLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost"
};

const taskLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

const leadBarColors: Record<LeadStatus, string> = {
  NEW: "bg-sky-500",
  CONTACTED: "bg-violet-500",
  QUALIFIED: "bg-amber-500",
  PROPOSAL: "bg-cyan-500",
  WON: "bg-emerald-500",
  LOST: "bg-rose-500"
};

const leadBarHex: Record<LeadStatus, string> = {
  NEW: "#38bdf8",
  CONTACTED: "#8b5cf6",
  QUALIFIED: "#f59e0b",
  PROPOSAL: "#06b6d4",
  WON: "#10b981",
  LOST: "#f43f5e"
};

const tooltipStyle = {
  background: "rgba(255,255,255,0.98)",
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: 8,
  boxShadow: "0 12px 32px rgba(16,24,40,0.12)",
  padding: "8px 12px",
  fontSize: 12
} as const;

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-[0.8125rem] font-semibold tabular-nums text-slate-900 dark:text-foreground">
          {value} <span className="font-normal text-slate-400 dark:text-muted-foreground">· {pct}%</span>
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { summary, summaryError } = useCrmData();

  const leadCounts = summary?.leadStageCounts || { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, WON: 0, LOST: 0 };
  const taskCounts = summary?.taskStatusCounts || { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const valueByStage = summary?.valueByStage || { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, WON: 0, LOST: 0 };

  if (!summary && summaryError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Understand performance with clear, actionable reporting." />
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[0.8125rem] text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Analytics data could not be loaded: {summaryError}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  const totalLeads = summary.stats.totalLeads || 0;
  const totalTasks = summary.stats.totalTasks || 0;
  const totalValue = summary.stats.totalValue || 0;

  const valueChartData = (Object.keys(leadLabels) as LeadStatus[]).map((status) => ({
    name: leadLabels[status],
    value: valueByStage[status],
    fill: leadBarHex[status]
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Understand performance with clear, actionable reporting." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Total leads</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totalLeads}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Total tasks</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totalTasks}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Closed won</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{summary?.stats.closedWon || 0}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lead stages</CardTitle>
              <CardDescription>Distribution across the current lead list.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {totalLeads === 0 ? (
              <EmptyState title="No lead data" description="Add leads to see stage analytics." />
            ) : (
              <div className="space-y-5">
                {(Object.keys(leadLabels) as LeadStatus[]).map((key) => (
                  <StatBar
                    key={key}
                    label={leadLabels[key]}
                    value={leadCounts[key]}
                    total={totalLeads}
                    color={leadBarColors[key]}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Task states</CardTitle>
              <CardDescription>Real task status breakdown from the board.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {totalTasks === 0 ? (
              <EmptyState title="No task data" description="Add tasks to see the status breakdown." />
            ) : (
              <div className="space-y-5">
                {(Object.keys(taskLabels) as TaskStatus[]).map((key) => (
                  <StatBar
                    key={key}
                    label={taskLabels[key]}
                    value={taskCounts[key]}
                    total={totalTasks}
                    color={key === "DONE" ? "bg-emerald-500" : key === "IN_PROGRESS" ? "bg-violet-500" : "bg-sky-500"}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Deal value by stage</CardTitle>
            <CardDescription>Total pipeline value across each lead stage.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {totalLeads === 0 || totalValue === 0 || valueChartData.every((entry) => entry.value === 0) ? (
            <EmptyState title="No deal value data" description="Add leads with a value to see revenue by stage." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={48}
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatMoney(Number(value)), "Value"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                    {valueChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
