"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { login, signup } from "@/services/auth";
import { AuthCard } from "../features/auth-card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type AuthValues = {
  name?: string;
  email: string;
  password: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2)
});

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { toast } = useToast();
  const schema = mode === "login" ? loginSchema : signupSchema;

  const form = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === "login" ? { email: "", password: "" } : { name: "", email: "", password: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = mode === "login"
        ? await login({ email: values.email, password: values.password })
        : await signup({ name: values.name, email: values.email, password: values.password });

      window.localStorage.setItem("flowcrm_access_token", response.accessToken);
      window.localStorage.setItem("flowcrm_refresh_token", response.refreshToken);
      window.localStorage.setItem("flowcrm_user", JSON.stringify(response.user));

      toast({
        title: mode === "login" ? "Welcome back" : "Account created",
        description: "You are now signed in to HR CRM."
      });
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: mode === "login" ? "Login failed" : "Signup failed",
        description: message
      });
    }
  });

  return (
    <AuthCard
      title={mode === "login" ? "Sign in to HR CRM" : "Create your account"}
      description={mode === "login"
        ? "Access your leads, tasks, and analytics in one place."
        : "Start managing your pipeline with a polished HR CRM experience."}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div className="space-y-1.5">
            <label className="text-[0.8125rem] font-medium text-foreground">Full name</label>
            <Input placeholder="Aarav Mehta" {...form.register("name")} />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[0.8125rem] font-medium text-foreground">Email</label>
          <Input type="email" placeholder="you@company.com" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[0.8125rem] font-medium text-foreground">Password</label>
          <Input type="password" placeholder="********" {...form.register("password")} />
        </div>
        <Button className="w-full" size="md" type="submit">
          {mode === "login" ? "Login" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.8125rem] text-slate-500">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <Link className="font-medium text-slate-950 transition-colors hover:text-slate-700" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </AuthCard>
  );
}
