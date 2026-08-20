import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.035] p-8 text-center shadow-elevated backdrop-blur-xl">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-cyan-300/80">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-[0.8125rem] text-muted-foreground/70">The page you requested does not exist or has moved.</p>
        <Button className="mt-5" size="md" asChild>
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
