// Auth service isolates login and signup requests from the UI.
import { apiRequest } from "./api";

export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  role?: "ADMIN" | "MANAGER" | "SALES";
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: { name: string; email: string; role: string };
};

export async function login(data: AuthPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export async function signup(data: AuthPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(data) });
}
