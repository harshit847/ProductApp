import { ReactNode } from "react";
import { Button } from "../ui/button";

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center dark:border-white/[0.1] dark:bg-white/[0.02]">
      {icon ? (
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[0.8125rem] font-semibold tracking-tight text-slate-900 dark:text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[0.8125rem] leading-5 text-slate-500 dark:text-muted-foreground/70">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
