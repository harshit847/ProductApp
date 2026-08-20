"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { LeadsTable } from "@/components/features/leads-table";
import { EmptyState } from "@/components/features/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrmData } from "@/hooks/use-crm-data";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";

export default function LeadsPage() {
  const { leads, leadsReady, leadsLoading, leadsError, saveLead, deleteLead, ensureLeads } = useCrmData();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    void ensureLeads();
  }, [ensureLeads]);

  const totals = useMemo(() => {
    const won = leads.filter((lead) => lead.status === "WON").length;
    const value = leads.reduce((sum, lead) => sum + lead.value, 0);
    return { won, value };
  }, [leads]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id);
      if (editingLead?.id === id) setEditingLead(null);
      toast({ title: "Lead deleted", description: "The lead was removed from the pipeline." });
    } catch (err) {
      toast({ title: "Unable to delete lead", description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  if (leadsLoading && !leadsReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading leads...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leadsError ? (
        <Card>
          <CardContent>
            <EmptyState title="Unable to load leads" description={leadsError} />
          </CardContent>
        </Card>
      ) : null}

      <PageHeader title="Leads" description="Capture, qualify, and manage every opportunity in your pipeline." />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Total leads</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{leads.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Closed won</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{totals.won}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card dark:border-white/[0.07]">
          <p className="text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">Pipeline value</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">${(totals.value / 1000).toFixed(1)}k</p>
        </div>
      </section>

      <Card id="lead-form">
        <CardHeader>
          <div>
            <CardTitle>{editingLead ? "Edit lead" : "Add lead"}</CardTitle>
            <CardDescription>Capture or update important opportunity details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LeadForm
            leadId={editingLead?.id}
            initialValues={editingLead ? { ...editingLead, owner: resolveOwnerName(editingLead.owner) } : undefined}
            submitLabel={editingLead ? "Update lead" : "Save lead"}
            onSave={(values) => saveLead(editingLead?.id, values)}
            onSaved={() => setEditingLead(null)}
            onCancel={() => setEditingLead(null)}
          />
        </CardContent>
      </Card>

      <LeadsTable leads={leads} onEdit={setEditingLead} onDelete={handleDelete} />
    </div>
  );
}
