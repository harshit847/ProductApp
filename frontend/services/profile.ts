// Profile service mirrors the backend profile endpoints for settings screens.
import { apiRequest } from "./api";
import { notify } from "@/hooks/use-notifications";

export async function updateProfile(data: { name?: string; phone?: string; department?: string; avatarUrl?: string }) {
  const result = await apiRequest("/profile/me", { method: "PATCH", body: JSON.stringify(data) });
  notify({ title: "Profile updated", detail: "Your profile information was saved.", tone: "cyan" });
  return result;
}

export function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiRequest("/profile/me/password", { method: "PATCH", body: JSON.stringify(data) });
}
