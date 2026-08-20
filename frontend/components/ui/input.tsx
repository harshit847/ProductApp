import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[0.8125rem] text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/[0.06] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-foreground dark:placeholder:text-muted-foreground/60 dark:hover:border-white/[0.14] dark:focus:border-white/[0.2]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
