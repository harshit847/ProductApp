import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[96px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[0.8125rem] text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/[0.06] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-foreground dark:placeholder:text-muted-foreground/60 dark:hover:border-white/[0.14] dark:focus:border-white/[0.2]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
