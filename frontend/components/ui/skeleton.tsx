import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.05]", className)} {...props} />;
}
