"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, FolderKanban, LayoutDashboard, LogOut, Settings, ShieldCheck, SquareKanban, Users, Workflow, X } from "lucide-react";
import { cn } from "@/utils/cn";

const sections = [
  {
    title: "Overview",
    links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    title: "CRM",
    links: [
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/pipeline", label: "Pipeline", icon: Workflow },
      { href: "/tasks", label: "Tasks", icon: SquareKanban },
      { href: "/analytics", label: "Analytics", icon: BarChart3 }
    ]
  },
  {
    title: "Account",
    links: [
      { href: "/profile", label: "Profile", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = () => {
    window.localStorage.removeItem("flowcrm_access_token");
    window.localStorage.removeItem("flowcrm_refresh_token");
    window.localStorage.removeItem("flowcrm_user");
    router.push("/login");
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen dark:border-white/[0.07] dark:bg-slate-950/80 dark:backdrop-blur-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-foreground">HR CRM</p>
              <p className="text-[0.6875rem] text-slate-500 dark:text-muted-foreground">Sales workspace</p>
            </div>
          </Link>
          <button
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:hover:bg-white/[0.06]"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-1.5 px-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-muted-foreground/70">
                {section.title}
              </div>
              <nav className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors duration-150",
                        active
                          ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-white/[0.06] dark:hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.6875rem] font-semibold text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
              VC
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">Workspace user</p>
              <p className="truncate text-[0.6875rem] text-slate-500 dark:text-muted-foreground">Signed in</p>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
