"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { DashboardSkeleton } from "../features/loading-skeleton";
import { CrmDataProvider } from "@/hooks/use-crm-data";

export function ProtectedShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("flowcrm_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f3f1ec] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <DashboardSkeleton />
      </div>
      </div>
    );
  }

  return (
    <CrmDataProvider>
      <AppShell>{children}</AppShell>
    </CrmDataProvider>
  );
}
