"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Clock3, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { useNotifications } from "@/hooks/use-notifications";
import type { AppNotification } from "@/hooks/use-notifications";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/features/empty-state";

type NotificationPrefs = {
  leadAlerts: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
};

const toneMap: Record<AppNotification["tone"], { icon: typeof Bell; toneClass: string; bgClass: string }> = {
  cyan: { icon: Clock3, toneClass: "text-cyan-700 dark:text-cyan-400", bgClass: "bg-cyan-50 dark:bg-cyan-500/10" },
  emerald: { icon: Check, toneClass: "text-emerald-700 dark:text-emerald-400", bgClass: "bg-emerald-50 dark:bg-emerald-500/10" },
  amber: { icon: Bell, toneClass: "text-amber-700 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-500/10" },
  rose: { icon: Bell, toneClass: "text-rose-700 dark:text-rose-400", bgClass: "bg-rose-50 dark:bg-rose-500/10" },
  violet: { icon: Bell, toneClass: "text-violet-700 dark:text-violet-400", bgClass: "bg-violet-50 dark:bg-violet-500/10" }
};

function formatTimestamp(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotifications();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    leadAlerts: true,
    taskReminders: true,
    weeklyDigest: false
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("flowcrm-settings");
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch {
        // ignore invalid storage
      }
    }
    setLoaded(true);
  }, []);

  const savePreferences = () => {
    window.localStorage.setItem("flowcrm-settings", JSON.stringify(prefs));
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Adjust notifications, theme mode, and workspace behavior." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="lg:h-fit">
          <CardHeader>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Delivery and workspace preferences.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.03]">
              <div>
                <p className="text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">Theme</p>
                <p className="mt-0.5 text-[0.75rem] text-slate-500 dark:text-muted-foreground">Switch between light and dark.</p>
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="cursor-pointer rounded-md border-0 bg-white px-2 py-1 text-[0.75rem] font-semibold capitalize text-slate-900 shadow-sm transition-colors hover:bg-slate-50 dark:bg-white/[0.08] dark:text-foreground dark:hover:bg-white/[0.14]"
              >
                {theme}
              </button>
            </div>

            <div className="space-y-2">
              {([
                { key: "leadAlerts" as const, label: "Lead alerts", desc: "Get notified when new leads enter the pipeline." },
                { key: "taskReminders" as const, label: "Task reminders", desc: "Receive prompts for upcoming task due dates." },
                { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Receive a summary of your pipeline performance." }
              ]).map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/80 bg-white px-4 py-3.5 transition-colors hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-[0.75rem] text-slate-500 dark:text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[item.key]}
                    onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
                      prefs[item.key] ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-white/[0.12]"
                    )}
                  >
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-slate-950", prefs[item.key] ? "translate-x-[18px]" : "translate-x-1")} />
                  </button>
                </label>
              ))}
            </div>

            <Button size="sm" onClick={savePreferences} className="mt-1">
              Save preferences
            </Button>
          </CardContent>
        </Card>

        <Card id="notifications" className="scroll-mt-6">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Notification history</CardTitle>
                <CardDescription>
                  {notifications.length} total notifications{unreadCount > 0 ? `, ${unreadCount} unread` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!loaded ? (
              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState title="No notifications yet" description="Activity will appear here once the workspace starts emitting updates." />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {notifications.map((item) => {
                  const { icon: Icon, toneClass, bgClass } = toneMap[item.tone] || toneMap.cyan;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 py-3.5 text-left transition-colors",
                        item.read ? "" : "bg-slate-50 dark:bg-white/[0.03]"
                      )}
                      onClick={() => markRead(item.id)}
                    >
                      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bgClass, toneClass)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[0.8125rem] font-medium text-slate-900 dark:text-foreground">{item.title}</span>
                          {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white" />}
                        </span>
                        <span className="mt-0.5 block text-[0.8125rem] leading-5 text-slate-500 dark:text-muted-foreground">{item.detail}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
