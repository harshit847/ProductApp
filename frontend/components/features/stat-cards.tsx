import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { StatCard } from "@/utils/types";
import { cn } from "@/utils/cn";

export function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((card) => {
        const Icon = card.trend === "up" ? ArrowUpRight : card.trend === "down" ? ArrowDownRight : Minus;
        const tone =
          card.trend === "down"
            ? "text-rose-600 dark:text-rose-400"
            : card.trend === "neutral"
              ? "text-slate-500 dark:text-muted-foreground"
              : "text-emerald-600 dark:text-emerald-400";

        const iconTone =
          card.trend === "down"
            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            : card.trend === "neutral"
              ? "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";

        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200/80 bg-card p-5 shadow-card transition-shadow duration-200 hover:shadow-cardHover dark:border-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[0.75rem] font-medium text-slate-500 dark:text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-foreground">{card.value}</p>
              </div>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconTone)}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className={cn("mt-3 flex items-center gap-1.5 text-[0.75rem] font-medium leading-4", tone)}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{card.change}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
