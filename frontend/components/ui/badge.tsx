import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-transparent bg-slate-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-slate-700 dark:bg-white/[0.08] dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
}
