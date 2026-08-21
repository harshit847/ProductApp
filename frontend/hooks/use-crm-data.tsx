// Shared CRM data store — the single source of truth for leads, tasks, and the
// dashboard summary across every page. Pages subscribe to this context instead of
// fetching on their own, and every mutation goes through here, so a change made in
// one screen (create, update, move, delete) is immediately reflected everywhere
// else without a manual refresh or a duplicated network request.
//
// The store keeps data in memory for the session: navigating between pages is
// instant. Mutations update the in-memory lists optimistically/immediately and
// re-fetch the server-aggregated dashboard summary in the background so counts and
// charts stay accurate.
"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getDashboardSummary } from "@/services/dashboard";
import {
  getLeads as apiGetLeads,
  createLead as apiCreateLead,
  updateLead as apiUpdateLead,
  deleteLead as apiDeleteLead
} from "@/services/leads";
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  completeTask as apiCompleteTask
} from "@/services/tasks";
import type { Lead, LeadStatus, DashboardSummary, Task, TaskStatus } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";
import type { LeadFormValues } from "@/services/leads";
import type { TaskFormValues } from "@/services/tasks";
import { notify } from "@/hooks/use-notifications";

const LEAD_LIMIT = 1000;
const EMPTY_LEAD_COUNTS: Record<LeadStatus, number> = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, WON: 0, LOST: 0 };
const EMPTY_TASK_COUNTS: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };

type CrmDataValue = {
  leads: Lead[];
  tasks: Task[];
  summary: DashboardSummary | null;
  leadsReady: boolean;
  tasksReady: boolean;
  summaryReady: boolean;
  leadsLoading: boolean;
  tasksLoading: boolean;
  summaryLoading: boolean;
  leadsError: string | null;
  tasksError: string | null;
  summaryError: string | null;
  refreshLeads: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  ensureLeads: () => Promise<void>;
  ensureTasks: () => Promise<void>;
  saveLead: (id: string | undefined, values: LeadFormValues) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  moveLead: (id: string, status: LeadStatus) => Promise<void>;
  saveTask: (id: string | undefined, values: TaskFormValues) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
};

const CrmDataContext = createContext<CrmDataValue | null>(null);

function normalizeLead(lead: Lead): Lead {
  return {
    ...lead,
    owner: resolveOwnerName(lead.owner),
    updatedAt: lead.updatedAt || new Date().toISOString()
  };
}

function normalizeTask(task: Task): Task {
  return {
    ...task,
    assignee: resolveOwnerName(task.assignee),
    completed: task.status === "DONE"
  };
}

function buildSummary(leads: Lead[], tasks: Task[], serverSummary: DashboardSummary | null): DashboardSummary {
  const leadStageCounts = { ...EMPTY_LEAD_COUNTS };
  const taskStatusCounts = { ...EMPTY_TASK_COUNTS };
  const valueByStage = { ...EMPTY_LEAD_COUNTS };

  for (const lead of leads) {
    leadStageCounts[lead.status] += 1;
    valueByStage[lead.status] += lead.value;
  }

  for (const task of tasks) {
    taskStatusCounts[task.status] += 1;
  }

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const closedWon = leadStageCounts.WON;
  const openLeads = leads.length - leadStageCounts.WON - leadStageCounts.LOST;
  const completedTasks = taskStatusCounts.DONE;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 5);

  const topLeads = [...leads].sort((a, b) => b.value - a.value).slice(0, 5);

  return {
    stats: {
      totalLeads: leads.length,
      closedWon,
      openLeads,
      totalValue,
      totalTasks: tasks.length,
      completedTasks
    },
    recentActivities: serverSummary?.recentActivities || [],
    recentLeads,
    topLeads,
    leadStageCounts,
    taskStatusCounts,
    valueByStage
  };
}

export function CrmDataProvider({ children }: PropsWithChildren) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [serverSummary, setServerSummary] = useState<DashboardSummary | null>(null);
  const [leadsReady, setLeadsReady] = useState(false);
  const [tasksReady, setTasksReady] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const summaryRefreshQueued = useRef(false);
  const summaryLoadingRef = useRef(false);
  const leadsLoadStarted = useRef(false);
  const tasksLoadStarted = useRef(false);
  const bootstrapped = useRef(false);

  const refreshLeads = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const response = await apiGetLeads({ limit: LEAD_LIMIT });
      setLeads(response.data.map(normalizeLead));
      setLeadsReady(true);
    } catch (error) {
      setLeadsError(error instanceof Error ? error.message : "Unable to load leads.");
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await apiGetTasks();
      setTasks((Array.isArray(data) ? data : []).map(normalizeTask));
      setTasksReady(true);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Unable to load tasks.");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    if (summaryLoadingRef.current) {
      summaryRefreshQueued.current = true;
      return;
    }

    summaryLoadingRef.current = true;
    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await getDashboardSummary();
      setServerSummary(data);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Unable to load dashboard data.");
    } finally {
      summaryLoadingRef.current = false;
      setSummaryLoading(false);
      if (summaryRefreshQueued.current) {
        summaryRefreshQueued.current = false;
        void refreshSummary();
      }
    }
  }, []);

  // The dashboard summary is the only thing the Dashboard/Analytics screens
  // need, so it is fetched immediately on login. The full lead and task lists
  // are only fetched on demand (see ensureLeads/ensureTasks) — the Dashboard
  // renders as soon as the lightweight summary arrives instead of waiting on
  // the heavier list endpoints.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void refreshSummary();
  }, [refreshSummary]);

  const ensureLeads = useCallback(async () => {
    if (leadsReady || leadsLoadStarted.current) return;
    leadsLoadStarted.current = true;
    try {
      await refreshLeads();
    } finally {
      leadsLoadStarted.current = false;
    }
  }, [leadsReady, refreshLeads]);

  const ensureTasks = useCallback(async () => {
    if (tasksReady || tasksLoadStarted.current) return;
    tasksLoadStarted.current = true;
    try {
      await refreshTasks();
    } finally {
      tasksLoadStarted.current = false;
    }
  }, [tasksReady, refreshTasks]);

  // Render from the server-aggregated summary as soon as it arrives. Once the
  // full lead/task lists finish loading we rebuild locally so mutations stay
  // reflected everywhere, but the dashboard never blocks on those heavier
  // requests again.
  const summary = useMemo<DashboardSummary | null>(() => {
    if (!serverSummary) return null;
    if (leadsReady && tasksReady) {
      return buildSummary(leads, tasks, serverSummary);
    }
    return serverSummary;
  }, [leads, tasks, serverSummary, leadsReady, tasksReady]);

  const summaryReady = leadsReady && tasksReady && !leadsError && !tasksError;
  const effectiveSummaryError = leadsError || tasksError || summaryError;

  const saveLead = useCallback(
    async (id: string | undefined, values: LeadFormValues) => {
      if (id) {
        const result = await apiUpdateLead(id, values);
        const updated = normalizeLead({ ...result, ...values, id: result.id });
        setLeads((current) => current.map((lead) => (lead.id === id ? updated : lead)));
        void refreshSummary();
        return updated;
      }

      const result = await apiCreateLead(values);
      const created = normalizeLead({ ...result, ...values, id: result.id });
      setLeads((current) => [created, ...current]);
      setLeadsReady(true);
      notify({
        title: "Lead created",
        detail: `${created.name} was added to the pipeline.`,
        tone: "emerald"
      });
      void refreshSummary();
      return created;
    },
    [refreshSummary]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      await apiDeleteLead(id);
      setLeads((current) => current.filter((lead) => lead.id !== id));
      void refreshSummary();
    },
    [refreshSummary]
  );

  const moveLead = useCallback(
    async (id: string, status: LeadStatus) => {
      const lead = leads.find((entry) => entry.id === id);
      if (!lead || lead.status === status) return;
      const previousStatus = lead.status;

      setLeads((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, status, updatedAt: new Date().toISOString() } : entry))
      );

      try {
        await apiUpdateLead(id, { status });
        void refreshSummary();
      } catch (error) {
        setLeads((current) =>
          current.map((entry) => (entry.id === id ? { ...entry, status: previousStatus } : entry))
        );
        throw error;
      }
    },
    [leads, refreshSummary]
  );

  const saveTask = useCallback(
    async (id: string | undefined, values: TaskFormValues) => {
      if (id) {
        const result = await apiUpdateTask(id, values);
        const updated = normalizeTask({ ...result, ...values, id: result.id });
        setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
        void refreshSummary();
        return updated;
      }

      const result = await apiCreateTask(values);
      const created = normalizeTask({ ...result, ...values, id: result.id });
      setTasks((current) => [created, ...current]);
      setTasksReady(true);
      notify({
        title: "Task created",
        detail: `${created.title} was added to the board.`,
        tone: "cyan"
      });
      void refreshSummary();
      return created;
    },
    [refreshSummary]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await apiDeleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      void refreshSummary();
    },
    [refreshSummary]
  );

  const completeTask = useCallback(
    async (id: string) => {
      const result = await apiCompleteTask(id);
      const updated = normalizeTask(result);
      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, ...updated, assignee: task.assignee, status: "DONE", completed: true } : task
        )
      );
      void refreshSummary();
    },
    [refreshSummary]
  );

  const value = useMemo<CrmDataValue>(
    () => ({
      leads,
      tasks,
      summary,
      leadsReady,
      tasksReady,
      summaryReady,
      leadsLoading,
      tasksLoading,
      summaryLoading,
      leadsError,
      tasksError,
      summaryError: effectiveSummaryError,
      refreshLeads,
      refreshTasks,
      refreshSummary,
      ensureLeads,
      ensureTasks,
      saveLead,
      deleteLead,
      moveLead,
      saveTask,
      deleteTask,
      completeTask
    }),
    [
      leads,
      tasks,
      summary,
      leadsReady,
      tasksReady,
      summaryReady,
      leadsLoading,
      tasksLoading,
      summaryLoading,
      leadsError,
      tasksError,
      effectiveSummaryError,
      refreshLeads,
      refreshTasks,
      refreshSummary,
      ensureLeads,
      ensureTasks,
      saveLead,
      deleteLead,
      moveLead,
      saveTask,
      deleteTask,
      completeTask
    ]
  );

  return <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>;
}

export function useCrmData() {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error("useCrmData must be used inside CrmDataProvider");
  return ctx;
}
