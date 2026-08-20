import { PropsWithChildren } from "react";
import { FolderKanban } from "lucide-react";
import { Card, CardDescription, CardTitle } from "../ui/card";

export function AuthCard({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 bg-white shadow-popover dark:border-white/[0.08] dark:bg-slate-950">
      <div className="px-6 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950">
          <FolderKanban className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-sm text-[0.875rem] text-slate-500 dark:text-muted-foreground">{description}</CardDescription>
      </div>
      <div className="px-6 pb-7 pt-5 sm:px-8">{children}</div>
    </Card>
  );
}
