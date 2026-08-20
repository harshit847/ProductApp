// Central fetch wrapper keeps API calls consistent and easy to swap later.
// Handles authentication headers, token refresh, and error normalization.

function normalizeApiBase(rawValue: string | undefined): string {
  const fallback = "/api";
  if (!rawValue) return fallback;

  const trimmed = rawValue.trim();
  if (!trimmed) return fallback;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const pathname = new URL(trimmed).pathname || fallback;
      return pathname.startsWith("/api") ? pathname : fallback;
    }
  } catch {
    // Ignore malformed URLs and fall through to the guarded relative checks.
  }

  if (trimmed.startsWith("/api")) return trimmed;
  if (trimmed.startsWith("/")) return fallback;
  if (/^[a-z]+:\/\//i.test(trimmed)) return fallback;
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1") || trimmed.includes(":3000")) {
    return fallback;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizeApiPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "/";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return "/";
    }
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
let refreshPromise: Promise<boolean> | null = null;
let redirectedToLogin = false;

type ApiOptions = RequestInit & {
  token?: string | null;
  _retry?: boolean;
  _retriedDb?: boolean;
};

/**
 * Decodes a JWT payload without verifying the signature (client-side only).
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true if the access token is expired or will expire within 30 seconds.
 * A 30-second buffer avoids the race where the token expires between the check
 * and the server receiving the request.
 */
function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now() + 30_000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Core API request helper. Automatically attaches the Bearer token from
 * localStorage, attempts a refresh when the access token expires, and
 * throws a readable error when the response is not OK.
 *
 * There is intentionally no HTTP-level response cache here. Cross-page
 * freshness is handled by the shared CRM data store (hooks/use-crm-data),
 * which owns the single source of truth for leads, tasks, and the dashboard
 * summary and invalidates it on every mutation - so no page can ever show
 * stale data after a create/update/delete/move.
 */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const apiPath = normalizeApiPath(path);
  const method = (options.method || "GET").toString().toUpperCase();
  const shouldRetryDb503 = method === "GET";

  // Read the access token from localStorage (browser-only).
  let token = options.token ?? (typeof window !== "undefined" ? window.localStorage.getItem("flowcrm_access_token") : null);

  // Proactively refresh before sending the request if the token is expired or
  // about to expire. This avoids a wasted 401 round-trip and the latency of
  // the reactive refresh-retry cycle.
  if (token && !options._retry && isTokenExpiringSoon(token)) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      token = typeof window !== "undefined" ? window.localStorage.getItem("flowcrm_access_token") : null;
    }
  }

  const response = await fetch(`${API_BASE}${apiPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    cache: "no-store"
  });

  // 503 = DB initializing. Wait briefly and retry once - the readiness gate
  // typically opens within a few seconds of server start.
  if (response.status === 503 && shouldRetryDb503 && !options._retriedDb) {
    await sleep(1500);
    return apiRequest<T>(apiPath, { ...options, _retriedDb: true });
  }

  // If the access token expired, try refreshing it once (unless we already retried).
  if (response.status === 401 && !options._retry) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return apiRequest<T>(apiPath, { ...options, _retry: true });
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Something went wrong");
  }

  // DELETE endpoints may return 204 No Content - guard against empty JSON.
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  return data;
}

/**
 * Attempts to use the stored refresh token to get a new access token.
 * Returns true if the refresh succeeded, false otherwise.
 *
 * Transient failures (503 DB initializing, network errors) are retried
 * briefly instead of immediately destroying the session.
 */
async function attemptTokenRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("flowcrm_refresh_token") : null;
        if (!refreshToken) return false;

        // Retry the refresh up to 3 times with back-off for transient DB errors.
        for (let attempt = 0; attempt < 3; attempt++) {
          const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
            cache: "no-store"
          });

          if (response.status === 429) {
            throw new Error("Rate limited - please wait a moment and try again.");
          }

          // 503 = DB initializing - wait and retry. Do NOT clear tokens or redirect;
          // the user's session is still valid, the DB is just cold-starting.
          if (response.status === 503) {
            if (attempt < 2) {
              await sleep(1000 * (attempt + 1));
              continue;
            }
            return false;
          }

          if (!response.ok) {
            // Refresh token is invalid - clear auth and redirect to login.
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("flowcrm_access_token");
              window.localStorage.removeItem("flowcrm_refresh_token");
              window.localStorage.removeItem("flowcrm_user");
              if (!redirectedToLogin) {
                redirectedToLogin = true;
                window.location.replace("/login");
              }
            }
            return false;
          }

          const data = await response.json();
          if (typeof window !== "undefined") {
            window.localStorage.setItem("flowcrm_access_token", data.accessToken);
            window.localStorage.setItem("flowcrm_refresh_token", data.refreshToken);
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
