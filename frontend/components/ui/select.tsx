import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[0.8125rem] text-slate-900 outline-none transition-colors duration-150 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/[0.06] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-foreground dark:hover:border-white/[0.14] dark:focus:border-white/[0.2]",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C/svg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
