"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, LayoutDashboard, ShieldCheck, SquareKanban, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderKanban } from "lucide-react";

const featureLinks = [
  { href: "/dashboard", title: "Dashboard", description: "Live metrics and pipeline health at a glance.", icon: LayoutDashboard },
  { href: "/leads", title: "Leads", description: "Capture, qualify, and manage every opportunity.", icon: Users },
  { href: "/pipeline", title: "Pipeline", description: "Track deals through each stage with clarity.", icon: Workflow },
  { href: "/tasks", title: "Tasks", description: "Align your team with priority-driven work.", icon: SquareKanban },
  { href: "/analytics", title: "Analytics", description: "Understand performance with reporting.", icon: BarChart3 },
  { href: "/profile", title: "Profile", description: "Keep your account details secure.", icon: ShieldCheck }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">HR CRM</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </header>

        <section className="rounded-2xl border border-white/[0.08] bg-slate-950/95 p-10 shadow-elevated sm:p-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Premium CRM workspace
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A polished CRM experience for modern teams.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-400">
                Manage your sales cadence with a premium dashboard, intelligent lead workflows, and thoughtful analytics designed for real business work.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-slate-900/80 p-6">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-slate-500">Workspace snapshot</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-lg bg-slate-950/95 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-slate-500">Monthly pipeline</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">$92.4k</p>
                    </div>
                    <div className="rounded-md border border-white/[0.08] bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-emerald-400">+18%</div>
                  </div>
                  <p className="mt-3 text-[0.8125rem] text-slate-400">Stronger growth from leads and faster close motion.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.08] bg-slate-950/95 p-4">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-slate-500">Leads</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">182</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-slate-950/95 p-4">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-slate-500">Tasks</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">47</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-slate-500">Highlights</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">Built for focus and speed</h2>
            <p className="mt-3 text-[0.875rem] leading-6 text-slate-400">
              Every section reflects real CRM activity with intuitive data layouts, purposeful spacing, and fast access to your pipeline, leads, tasks, and analytics.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-slate-500">Navigate</p>
            <div className="mt-4 grid gap-2.5">
              {featureLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-slate-950/60 px-4 py-3 transition-colors hover:border-white/[0.14] hover:bg-slate-950"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-medium text-white">{item.title}</p>
                      <p className="truncate text-[0.75rem] text-slate-400">{item.description}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-white" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
