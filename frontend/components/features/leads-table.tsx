"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { Lead } from "@/utils/types";
import { resolveOwnerName } from "@/utils/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { EmptyState } from "./empty-state";

const PAGE_SIZE = 8;

const statusColors: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  CONTACTED: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  QUALIFIED: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PROPOSAL: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  WON: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  LOST: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
};

export function LeadsTable({
  leads,
  onEdit,
  onDelete
}: {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Lead["status"] | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filteredLeads = useMemo(() => {
    const search = query.toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        lead.name.toLowerCase().includes(search) ||
        lead.company.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search);
      const matchesStatus = status === "ALL" || lead.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const pagedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Lead management</CardTitle>
          <CardDescription>Search, filter, and manage your leads.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 transition-colors focus-within:border-slate-400">
            <Search className="h-3.5 w-3.5" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search leads..."
              className="h-8 border-0 bg-transparent px-0 shadow-none focus:ring-0 dark:bg-transparent"
            />
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1 lg:justify-end">
            {(["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const).map((item) => (
              <Button
                key={item}
                variant={status === item ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        {pagedLeads.length === 0 ? (
          <EmptyState title="No leads found" description="Try a different search term or status filter." />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-white/[0.07]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-[0.8125rem]">
                  <thead className="bg-slate-50 text-left text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-slate-400 dark:bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Lead</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Owner</th>
                      <th className="px-4 py-2.5 font-medium">Value</th>
                      <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {pagedLeads.map((lead) => (
                      <tr key={lead.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium leading-5 text-slate-900 dark:text-foreground">{lead.name}</p>
                          <p className="text-[0.6875rem] text-slate-500 dark:text-muted-foreground">{lead.company}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge className={statusColors[lead.status] || "bg-slate-100 text-slate-600"}>{lead.status}</Badge>
                        </td>
                        <td className="hidden px-4 py-3 align-top text-slate-500 sm:table-cell dark:text-muted-foreground">{resolveOwnerName(lead.owner)}</td>
                        <td className="px-4 py-3 align-top font-medium tabular-nums text-slate-900 dark:text-foreground">${lead.value.toLocaleString()}</td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(lead.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.8125rem] text-slate-500 dark:text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((c) => c - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((c) => c + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
