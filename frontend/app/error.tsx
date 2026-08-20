"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-white/[0.08] dark:bg-slate-950">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">500</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-foreground">Something went wrong</h1>
        <p className="mt-2 text-[0.875rem] leading-6 text-slate-500 dark:text-muted-foreground">
          Please try again, or return to the dashboard if the problem persists.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
