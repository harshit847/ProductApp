"use client";

import { useMemo, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Task } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";
import { Pencil } from "lucide-react";
import { EmptyState } from "./empty-state";

function formatDueDate(value?: string) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const columnMeta = [
  { key: "TODO", title: "To do", accent: "bg-sky-400", count: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  { key: "IN_PROGRESS", title: "In progress", accent: "bg-violet-400", count: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" },
  { key: "DONE", title: "Done", accent: "bg-emerald-400", count: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" }
] as const;

export function TaskBoard({
  tasks,
  onComplete,
  onEdit
}: {
  tasks: Task[];
  onComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}) {
  const columns = useMemo(() => [
    { key: "TODO" as const, items: tasks.filter((task) => task.status === "TODO") },
    { key: "IN_PROGRESS" as const, items: tasks.filter((task) => task.status === "IN_PROGRESS") },
    { key: "DONE" as const, items: tasks.filter((task) => task.status === "DONE") }
  ], [tasks]);

  const handleComplete = useCallback(async (id: string) => {
    await onComplete(id);
  }, [onComplete]);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No tasks yet"
            description="Create your first task to start organizing follow-ups and next actions."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const meta = columnMeta.find((item) => item.key === column.key)!;
        return (
          <div key={column.key} className="rounded-xl border border-slate-200/80 bg-card shadow-card dark:border-white/[0.07]">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.accent}`} />
                <h4 className="text-[0.8125rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">{meta.title}</h4>
              </div>
              <Badge className={meta.count}>{column.items.length}</Badge>
            </div>
            <div className="space-y-2 p-3">
              {column.items.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-3.5 transition-colors duration-150 hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/[0.14]"
                >
                  <p className="text-[0.8125rem] font-medium leading-5 text-slate-900 dark:text-foreground">{task.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[0.6875rem] text-slate-500 dark:text-muted-foreground">
                    <span className="truncate">{resolveOwnerName(task.assignee)}</span>
                    <span className="text-slate-300 dark:text-muted-foreground/30">·</span>
                    <span className="truncate">{formatDueDate(task.dueDate)}</span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Button className="flex-1" size="sm" variant="outline" onClick={() => onEdit(task)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    {task.status !== "DONE" && (
                      <Button className="flex-1" size="sm" variant="secondary" onClick={() => handleComplete(task.id)}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {column.items.length === 0 && (
                <p className="py-8 text-center text-[0.75rem] text-slate-400 dark:text-muted-foreground/60">No tasks here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
