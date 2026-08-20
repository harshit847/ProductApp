import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, children, ...props }, ref) => {
    const variants = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.25)] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
      secondary:
        "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/[0.1]",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-muted-foreground dark:hover:bg-white/[0.06] dark:hover:text-foreground",
      outline:
        "border border-slate-200 bg-transparent text-slate-900 shadow-sm hover:bg-slate-50 active:bg-slate-100 dark:border-white/[0.08] dark:text-foreground dark:hover:bg-white/[0.06]"
    }[variant];

    const sizes = {
      sm: "h-8 px-3 text-[0.8125rem] rounded-lg gap-1.5",
      md: "h-9 px-4 text-[0.8125rem] rounded-lg gap-1.5",
      lg: "h-10 px-5 text-sm rounded-lg gap-2"
    }[size];

    const buttonClassName = cn(
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap select-none dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-slate-950",
      variants,
      sizes,
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(buttonClassName, (children.props as { className?: string }).className)
      });
    }

    return (
      <button ref={ref} className={buttonClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
