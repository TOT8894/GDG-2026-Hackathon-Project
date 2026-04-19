/**
 * API client for Kuralew backend.
 * Set `VITE_API_BASE_URL` in `.env` (e.g. http://localhost:4000) — no trailing slash.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const ACCESS_KEY = "kuralew_access_token";
const REFRESH_KEY = "kuralew_refresh_token";

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken != null) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken != null) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function pickTokens(payload) {
  if (!payload || typeof payload !== "object") return {};
  const p = payload.data ?? payload.user ?? payload;
  const accessToken =
    payload.accessToken ??
    payload.token ??
    p?.accessToken ??
    p?.token;
  const refreshToken =
    payload.refreshToken ?? p?.refreshToken ?? payload.refresh_token;
  return { accessToken, refreshToken };
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const body = await parseBody(res);
  if (!res.ok) return false;
  const tokens = pickTokens(body);
  if (tokens.accessToken) {
    setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    return true;
  }
  return false;
}

/**
 * @param {string} path - e.g. `/payments`
 * @param {RequestInit & { auth?: boolean, json?: unknown }} options
 */
export async function apiRequest(path, options = {}) {
  const { auth = true, json, ...init } = options;
  const headers = new Headers(init.headers);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(json);
  }
  if (auth) {
    const t = getAccessToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const ok = await refreshPromise;
    if (ok) {
      const t2 = getAccessToken();
      if (t2) headers.set("Authorization", `Bearer ${t2}`);
      res = await fetch(url, { ...init, headers });
    }
  }

  const body = await parseBody(res);
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

/** Normalize list responses: [], { data: [] }, { payments: [] }, etc. */
export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function paymentId(payment) {
  if (!payment) return "";
  return String(payment.id ?? payment._id ?? payment.paymentId ?? "");
}

export const authApi = {
  register: (json) => apiRequest("/auth/register", { method: "POST", auth: false, json }),
  login: (json) => apiRequest("/auth/login", { method: "POST", auth: false, json }),
  refresh: (json) =>
    apiRequest("/auth/refresh", { method: "POST", auth: false, json }),
  profile: () => apiRequest("/auth/profile", { method: "GET" }),
  updateProfile: (json) => apiRequest("/auth/updateProfile", { method: "PUT", json }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const paymentsApi = {
  create: (json) => apiRequest("/payments", { method: "POST", json }),
  list: () => apiRequest("/payments", { method: "GET" }),
  get: (id) => apiRequest(`/payments/${id}`, { method: "GET" }),
  updateStatus: (id, json) =>
    apiRequest(`/payments/${id}/status`, { method: "PUT", json }),
};

export function storeSessionFromAuthResponse(body) {
  const { accessToken, refreshToken } = pickTokens(body);
  if (accessToken || refreshToken) setTokens({ accessToken, refreshToken });
}

export { BASE_URL, ACCESS_KEY };
