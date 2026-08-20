"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { TaskBoard } from "@/components/features/task-board";
import { EmptyState } from "@/components/features/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/forms/task-form";
import { useCrmData } from "@/hooks/use-crm-data";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";

export default function TasksPage() {
  const { tasks, tasksReady, tasksLoading, tasksError, saveTask, completeTask, ensureTasks } = useCrmData();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    void ensureTasks();
  }, [ensureTasks]);

  const totals = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "TODO").length,
      progress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: tasks.filter((task) => task.status === "DONE").length
    }),
    [tasks]
  );

  const handleComplete = async (id: string) => {
    try {
      await completeTask(id);
      if (editingTask?.id === id) setEditingTask(null);
      toast({ title: "Task completed", description: "The task was marked as done." });
    } catch (err) {
      toast({ title: "Unable to complete task", description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  if (tasksLoading && !tasksReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksError ? (
        <Card>
          <CardContent>
            <EmptyState title="Unable to load tasks" description={tasksError} />
          </CardContent>
        </Card>
      ) : null}

      <PageHeader title="Tasks" description="Organize and track the work that keeps your sales team moving." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">To do</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totals.todo}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">In progress</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totals.progress}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Done</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totals.done}</p>
        </div>
      </div>

      <Card id="task-form">
        <CardHeader>
          <div>
            <CardTitle>{editingTask ? "Edit task" : "Create task"}</CardTitle>
            <CardDescription>Save and organize work for your team.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TaskForm
            taskId={editingTask?.id}
            initialValues={editingTask ? { ...editingTask, assignee: resolveOwnerName(editingTask.assignee) } : undefined}
            submitLabel={editingTask ? "Update task" : "Save task"}
            onSave={(values) => saveTask(editingTask?.id, values)}
            onSaved={() => setEditingTask(null)}
            onCancel={() => setEditingTask(null)}
          />
        </CardContent>
      </Card>

      <TaskBoard tasks={tasks} onComplete={handleComplete} onEdit={setEditingTask} />
    </div>
  );
}
