"use client";

import Link from "next/link";
import { Menu, MoveRight, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationBell } from "./notification-bell";

const titles: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Overview", title: "Dashboard" },
  "/leads": { eyebrow: "CRM", title: "Leads" },
  "/pipeline": { eyebrow: "CRM", title: "Pipeline" },
  "/tasks": { eyebrow: "CRM", title: "Tasks" },
  "/analytics": { eyebrow: "CRM", title: "Analytics" },
  "/profile": { eyebrow: "Account", title: "Profile" },
  "/settings": { eyebrow: "Account", title: "Settings" }
};

function TopbarActions({ pathname }: { pathname: string }) {
  if (pathname === "/tasks") {
    return (
      <Button asChild size="sm">
        <a href="#task-form" className="inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New task
        </a>
      </Button>
    );
  }

  if (pathname === "/leads") {
    return (
      <Button asChild size="sm">
        <a href="#lead-form" className="inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New lead
        </a>
      </Button>
    );
  }

  if (pathname === "/pipeline") {
    return (
      <Button variant="secondary" asChild size="sm">
        <Link href="/leads" className="inline-flex items-center gap-1.5">
          <MoveRight className="h-3.5 w-3.5" />
          Manage leads
        </Link>
      </Button>
    );
  }

  return null;
}

export function Topbar({
  onMenuClick,
  pathname,
  onSearchClick
}: {
  onMenuClick: () => void;
  pathname: string;
  onSearchClick: () => void;
}) {
  const current = titles[pathname] || { eyebrow: "Workspace", title: "HR CRM" };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10 dark:border-white/[0.07] dark:bg-slate-950/80">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="text-slate-400 dark:text-muted-foreground/70">{current.eyebrow}</span>
        <span className="text-slate-300 dark:text-muted-foreground/40">/</span>
        <span className="truncate font-medium text-slate-900 dark:text-foreground">{current.title}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSearchClick}
          className="hidden h-8 w-44 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[0.8125rem] text-slate-500 transition-colors hover:border-slate-300 hover:bg-white md:flex dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-muted-foreground dark:hover:border-white/[0.14]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search workspace…</span>
        </button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analytics" className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Insights
          </Link>
        </Button>
        <NotificationBell />
        <TopbarActions pathname={pathname} />
      </div>
    </header>
  );
}
