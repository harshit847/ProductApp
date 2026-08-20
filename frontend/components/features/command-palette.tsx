"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Command, Search } from "lucide-react";
import { Button } from "../ui/button";

const shortcuts = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Tasks", href: "/tasks" },
  { label: "Analytics", href: "/analytics" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" }
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Reset the search term every time the palette opens.
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filteredShortcuts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return shortcuts;
    return shortcuts.filter(
      (item) => item.label.toLowerCase().includes(term) || item.href.toLowerCase().includes(term)
    );
  }, [query]);

  if (!open) {
    return (
      <Button
        className="fixed bottom-5 right-5 z-50 rounded-lg border border-slate-200 bg-white px-3 text-slate-600 shadow-card hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-950 dark:text-slate-300"
        variant="outline"
        size="sm"
        onClick={() => onOpenChange(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-[0.75rem]">Ctrl</span>
        <Command className="h-3 w-3" />
        <span className="text-[0.75rem]">K</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/25 px-4 pt-24 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-2 shadow-popover dark:border-white/[0.1] dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-white/[0.04]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace…"
            className="w-full bg-transparent text-[0.8125rem] text-slate-900 outline-none placeholder:text-slate-400 dark:text-foreground"
          />
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Esc
          </Button>
        </div>
        <div className="mt-1 space-y-0.5 pt-1">
          <p className="px-3 pb-1 pt-2 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-muted-foreground/70">Quick actions</p>
          {filteredShortcuts.length === 0 ? (
            <p className="px-3 py-6 text-center text-[0.8125rem] text-slate-500 dark:text-muted-foreground">
              No matches for “{query}”.
            </p>
          ) : (
            filteredShortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-white/[0.05] dark:hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                {item.label}
                <span className="text-[0.6875rem] text-slate-400">↵</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
