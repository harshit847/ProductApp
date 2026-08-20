// Providers keep global UI concerns like theme and toasts out of page code.
"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "@/hooks/use-toast";
import { NotificationProvider } from "@/hooks/use-notifications";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
