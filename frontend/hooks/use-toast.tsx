"use client";

import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(() => {
    return {
      toasts,
      toast: (toast) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { ...toast, id }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 4000);
      },
      dismiss: (id) => setToasts((current) => current.filter((item) => item.id !== id))
    };
  }, [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

export function ToastViewport() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2 sm:bottom-5 sm:right-5">
      {context.toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/[0.08] bg-slate-950/95 p-3.5 shadow-elevated backdrop-blur-xl"
          style={{ animation: "toast-in 0.25s cubic-bezier(0.21,1.02,0.73,1) forwards" }}
        >
          <p className="text-[0.8125rem] font-semibold">{toast.title}</p>
          {toast.description ? <p className="mt-0.5 text-[0.75rem] leading-4 text-muted-foreground/70">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
