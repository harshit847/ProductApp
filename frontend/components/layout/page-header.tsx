import { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function PageHeader({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">{title}</h1>
        {description ? <p className={cn("mt-1 text-sm text-slate-500 dark:text-muted-foreground")}>{description}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </div>
  );
}
