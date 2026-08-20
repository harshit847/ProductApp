"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { changePassword, updateProfile } from "@/services/profile";

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  department: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

export function ProfileForm({
  defaultName,
  defaultPhone,
  defaultDepartment
}: {
  defaultName?: string;
  defaultPhone?: string;
  defaultDepartment?: string;
}) {
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultName || "",
      phone: defaultPhone || "",
      department: defaultDepartment || ""
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" }
  });

  useEffect(() => {
    if (defaultName) {
      profileForm.reset({ name: defaultName, phone: defaultPhone || "", department: defaultDepartment || "" });
    }
  }, [defaultName, defaultPhone, defaultDepartment, profileForm]);

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateProfile(values);
      toast({ title: "Profile updated", description: `${values.name} saved successfully.` });
    } catch (error) {
      toast({ title: "Profile update failed", description: error instanceof Error ? error.message : "Please try again." });
    }
  });

  const savePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePassword(values);
      toast({ title: "Password changed", description: "Your account password was updated." });
      passwordForm.reset();
    } catch (error) {
      toast({ title: "Password update failed", description: error instanceof Error ? error.message : "Please try again." });
    }
  });

  return (
    <div className="space-y-5">
      <form className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={saveProfile}>
        <div className="space-y-1.5">
          <label className="text-[0.8125rem] font-medium text-foreground">Name</label>
          <Input placeholder="Name" {...profileForm.register("name")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[0.8125rem] font-medium text-foreground">Phone</label>
          <Input placeholder="Phone" {...profileForm.register("phone")} />
        </div>
        <div className="space-y-1.5 xl:col-span-1">
          <label className="text-[0.8125rem] font-medium text-foreground">Department</label>
          <Input placeholder="Department" {...profileForm.register("department")} />
        </div>
        <Button className="md:col-span-2 xl:col-span-3" size="md" type="submit">
          Update profile
        </Button>
      </form>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">
        <h3 className="text-[0.9375rem] font-semibold tracking-tight text-slate-950 dark:text-foreground">Change password</h3>
        <p className="mt-0.5 text-[0.8125rem] text-slate-500 dark:text-muted-foreground">Keep your account secure with a current and new password.</p>
        <form className="mt-4 grid w-full gap-4 md:grid-cols-2" onSubmit={savePassword}>
          <div className="space-y-1.5">
            <label className="text-[0.8125rem] font-medium text-foreground">Current password</label>
            <Input type="password" placeholder="Current password" {...passwordForm.register("currentPassword")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[0.8125rem] font-medium text-foreground">New password</label>
            <Input type="password" placeholder="New password" {...passwordForm.register("newPassword")} />
          </div>
          <Button className="md:col-span-2" size="md" type="submit">
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}
