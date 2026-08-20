"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Check, ChevronRight, Clock3 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { AppNotification } from "@/hooks/use-notifications";
import { cn } from "@/utils/cn";

const toneMap: Record<AppNotification["tone"], { icon: typeof Bell; toneClass: string; bgClass: string }> = {
  cyan: { icon: Clock3, toneClass: "text-cyan-700 dark:text-cyan-400", bgClass: "bg-cyan-50 dark:bg-cyan-500/10" },
  emerald: { icon: Check, toneClass: "text-emerald-700 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-500/10" },
  amber: { icon: Bell, toneClass: "text-amber-700 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-500/10" },
  rose: { icon: Bell, toneClass: "text-rose-700 dark:text-rose-400", bgClass: "bg-rose-50 dark:bg-rose-500/10" },
  violet: { icon: Bell, toneClass: "text-violet-700 dark:text-violet-400", bgClass: "bg-violet-50 dark:bg-violet-500/10" }
};

function formatTimestamp(ts: number) {
  const date = new Date(ts);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const latest = notifications.slice(0, 3);
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06]",
          open && "bg-slate-50 text-slate-900 dark:bg-white/[0.06] dark:text-foreground"
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.625rem] font-semibold leading-none text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[21rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-popover dark:border-white/[0.1] dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
            <p className="text-[0.8125rem] font-semibold text-slate-900 dark:text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[0.75rem] font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[19rem] overflow-y-auto">
            {latest.length === 0 ? (
              <p className="px-4 py-8 text-center text-[0.8125rem] text-slate-500 dark:text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              latest.map((item) => {
                const { icon: Icon, toneClass, bgClass } = toneMap[item.tone] || toneMap.cyan;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markRead(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                      !item.read && "bg-slate-50/70 dark:bg-white/[0.02]"
                    )}
                  >
                    <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bgClass, toneClass)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{item.title}</span>
                        {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.75rem] leading-4 text-slate-500 dark:text-muted-foreground">{item.detail}</span>
                      <span className="mt-0.5 block text-[0.6875rem] text-slate-400 dark:text-muted-foreground/70">{formatTimestamp(item.timestamp)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <Link
            href="/settings#notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[0.8125rem] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-foreground"
          >
            View all notifications
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
