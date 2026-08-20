"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/services/api";
import { EmptyState } from "@/components/features/empty-state";

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const data = await apiRequest<UserProfile>("/auth/me");
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-slate-200/80 bg-card shadow-card">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Edit your account details and contact information." />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profile settings</CardTitle>
            <CardDescription>Details shown across the workspace.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-6">
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">{profile.name}</dd>
                </div>
                <div className="border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-muted-foreground">Role</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">{profile.role}</dd>
                </div>
                <div className="border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">{profile.email}</dd>
                </div>
                <div className="border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-muted-foreground">Department</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">{profile.department || "Not set"}</dd>
                </div>
              </dl>
              <ProfileForm defaultName={profile.name} defaultPhone={profile.phone} defaultDepartment={profile.department} />
            </div>
          ) : (
            <EmptyState title="No profile available" description="Sign in again or check the backend profile endpoint." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
