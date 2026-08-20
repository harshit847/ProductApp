"use client";

import { useState, useCallback, useRef, useMemo, type DragEvent } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/utils/cn";
import type { Lead, LeadStatus } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";
import { EmptyState } from "./empty-state";

const stages: { key: LeadStatus; label: string; dot: string; count: string }[] = [
  { key: "NEW", label: "New", dot: "bg-sky-400", count: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  { key: "CONTACTED", label: "Contacted", dot: "bg-violet-400", count: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" },
  { key: "QUALIFIED", label: "Qualified", dot: "bg-amber-400", count: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  { key: "PROPOSAL", label: "Proposal", dot: "bg-cyan-400", count: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" },
  { key: "WON", label: "Won", dot: "bg-emerald-400", count: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  { key: "LOST", label: "Lost", dot: "bg-rose-400", count: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" }
];

function formatValue(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
}

export function LeadPipeline({
  leads,
  onMoveLead
}: {
  leads: Lead[];
  onMoveLead: (leadId: string, newStatus: LeadStatus) => void;
}) {
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const dropCooldown = useRef(false);

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      NEW: [], CONTACTED: [], QUALIFIED: [], PROPOSAL: [], WON: [], LOST: []
    };
    for (const lead of leads) {
      map[lead.status].push(lead);
    }
    return map;
  }, [leads]);

  const handleDragStart = useCallback((e: DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingLeadId(leadId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingLeadId(null);
    setDragOverStage(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, stage: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent, targetStage: LeadStatus) => {
      e.preventDefault();
      if (dropCooldown.current) return;

      const leadId = e.dataTransfer.getData("text/plain");
      if (!leadId) return;

      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status === targetStage) {
        setDragOverStage(null);
        setDraggingLeadId(null);
        return;
      }

      dropCooldown.current = true;
      onMoveLead(leadId, targetStage);
      setDragOverStage(null);
      setDraggingLeadId(null);
      setTimeout(() => { dropCooldown.current = false; }, 300);
    },
    [leads, onMoveLead]
  );

  if (!leads.length) {
    return (
      <EmptyState
        title="No leads in pipeline"
        description="Create a lead first, then drag it across stages to update the pipeline."
      />
    );
  }

  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {stages.map((stage) => {
        const stageLeads = leadsByStage[stage.key];
        const isOver = dragOverStage === stage.key;

        return (
          <div
            key={stage.key}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
            className={cn(
              "flex min-h-[20rem] min-w-0 flex-col rounded-xl border border-slate-200/80 bg-card p-3 shadow-card transition-all duration-200 dark:border-white/[0.07]",
              isOver && "scale-[1.01] border-slate-400 ring-2 ring-slate-200 dark:ring-white/[0.12]"
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                <h4 className="text-[0.8125rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">{stage.label}</h4>
              </div>
              <Badge className={stage.count}>{stageLeads.length}</Badge>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "cursor-grab rounded-lg border border-slate-200/80 bg-white p-3 transition-colors duration-150 hover:border-slate-300 active:cursor-grabbing dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/[0.14]",
                    draggingLeadId === lead.id && "opacity-40"
                  )}
                >
                  <p className="text-[0.8125rem] font-medium leading-5 text-slate-900 dark:text-foreground">{lead.name}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-slate-500 dark:text-muted-foreground">{lead.company}</p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[0.6875rem] text-slate-500 dark:text-muted-foreground">{resolveOwnerName(lead.owner)}</span>
                    <span className="shrink-0 text-[0.6875rem] font-semibold tabular-nums text-blue-700 dark:text-sky-400">{formatValue(lead.value)}</span>
                  </div>
                </div>
              ))}

              {stageLeads.length === 0 && (
                <p className="py-8 text-center text-[0.6875rem] text-slate-400 dark:text-muted-foreground/60">Drop leads here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
