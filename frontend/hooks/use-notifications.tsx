// Persistent notification store backed by localStorage.
// Services call notify() directly; the React context exposes UI state.
"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  tone: "cyan" | "emerald" | "amber" | "rose" | "violet";
  read: boolean;
  timestamp: number;
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const STORAGE_KEY = "flowcrm_notifications";
const MAX_NOTIFICATIONS = 50;

const NotificationContext = createContext<NotificationContextValue | null>(null);

// Global setter so services can push notifications without React context.
let globalAddNotification: ((n: Omit<AppNotification, "id" | "read" | "timestamp">) => void) | null = null;

export function notify(n: Omit<AppNotification, "id" | "read" | "timestamp">) {
  globalAddNotification?.(n);
}

function loadFromStorage(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: AppNotification[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded – silently ignore */ }
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadFromStorage);
  const initialRef = useRef(true);

  // Persist whenever the list changes (skip the initial mount read).
  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    saveToStorage(notifications);
  }, [notifications]);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "read" | "timestamp">) => {
    const item: AppNotification = { ...n, id: crypto.randomUUID(), read: false, timestamp: Date.now() };
    setNotifications((current) => [item, ...current].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Register global setter once.
  useEffect(() => {
    globalAddNotification = addNotification;
    return () => { globalAddNotification = null; };
  }, [addNotification]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }),
    [notifications, unreadCount, addNotification, markRead, markAllRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
