import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-px w-full bg-slate-200 dark:bg-white/[0.08]", className)} {...props} />;
}
