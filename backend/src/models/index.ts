// Small DTO layer keeps route handlers easy to scan during interviews.
export type JwtUser = {
  userId: string;
  role: "ADMIN" | "MANAGER" | "SALES";
  email: string;
};
