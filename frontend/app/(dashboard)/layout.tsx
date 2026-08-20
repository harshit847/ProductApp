// Dashboard layout protects product pages and keeps the shell consistent.
import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/layout/protected-shell";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
