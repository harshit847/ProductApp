"use client";

import { useEffect, useMemo } from "react";
import { Loader2, Workflow } from "lucide-react";
import { LeadPipeline } from "@/components/features/lead-pipeline";
import { EmptyState } from "@/components/features/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCrmData } from "@/hooks/use-crm-data";
import { useToast } from "@/hooks/use-toast";
import type { LeadStatus } from "@/utils/types";

export default function PipelinePage() {
  const { leads, leadsReady, leadsLoading, leadsError, moveLead, ensureLeads } = useCrmData();
  const { toast } = useToast();

  useEffect(() => {
    void ensureLeads();
  }, [ensureLeads]);

  const handleMoveLead = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await moveLead(leadId, newStatus);
      toast({ title: "Lead updated", description: `Moved to ${newStatus.replace("_", " ").toLowerCase()}.` });
    } catch (err) {
      toast({ title: "Unable to move lead", description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const totals = useMemo(() => {
    const value = leads.reduce((sum, lead) => sum + lead.value, 0);
    const open = leads.filter((lead) => lead.status !== "WON" && lead.status !== "LOST").length;
    return { value, open };
  }, [leads]);

  if (leadsLoading && !leadsReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pipeline...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leadsError ? (
        <Card>
          <CardContent>
            <EmptyState title="Unable to load pipeline" description={leadsError} />
          </CardContent>
        </Card>
      ) : null}

      <PageHeader title="Pipeline" description="Move opportunities through your CRM stages with drag and drop." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Total leads</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{leads.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Open opportunities</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totals.open}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Pipeline value</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">${(totals.value / 1000).toFixed(1)}k</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState title="No leads in pipeline" description="Create a lead first, then move it through the stages." icon={<Workflow className="h-5 w-5" />} />
          </CardContent>
        </Card>
      ) : (
        <LeadPipeline leads={leads} onMoveLead={handleMoveLead} />
      )}
    </div>
  );
}
