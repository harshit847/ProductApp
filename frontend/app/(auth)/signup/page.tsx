import { FolderKanban } from "lucide-react";
import { AuthForm } from "@/components/forms/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/90 shadow-elevated sm:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.08),_transparent_30%)] p-10 sm:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">HR CRM</span>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">Start selling faster</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Create your account in minutes.</h1>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-7 text-slate-400">
              Join your team and unlock polished pipeline continuity, activity tracking, and analytics in one elegant workspace.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-300">Free to get started</span>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <AuthForm mode="signup" />
        </section>
      </div>
    </main>
  );
}
