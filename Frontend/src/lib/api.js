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
  changePassword: (json) => apiRequest("/auth/changePassword", { method: "PUT", json }),
  forgotPassword: (json) => apiRequest("/auth/forgotPassword", { method: "POST", auth: false, json }),
  resetPassword: (json) => apiRequest("/auth/resetPassword", { method: "POST", auth: false, json }),
  verifyEmail: (token) => apiRequest(`/auth/verify-email/${token}`, { method: "GET", auth: false }),
  resendVerification: () => apiRequest("/auth/resend-verification", { method: "POST" }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const chatApi = {
  sendMessage: (json) => apiRequest("/chat", { method: "POST", json }),
  getMyChats: (params) => apiRequest(`/chat?${new URLSearchParams(params)}`, { method: "GET" }),
  getConversation: (userId, params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/chat/conversation/${userId}${query}`, { method: "GET" });
  },
  getChatById: (id) => apiRequest(`/chat/${id}`, { method: "GET" }),
  updateMessage: (id, json) => apiRequest(`/chat/${id}`, { method: "PUT", json }),
  deleteMessage: (id) => apiRequest(`/chat/${id}`, { method: "DELETE" }),
  markMessageRead: (id) => apiRequest(`/chat/${id}/read`, { method: "PUT" }),
};

export const groupChatApi = {
  createGroup: (json) => apiRequest("/groups", { method: "POST", json }),
  getMyGroups: () => apiRequest("/groups", { method: "GET" }),
  getGroupById: (id) => apiRequest(`/groups/${id}`, { method: "GET" }),
  deleteGroup: (id) => apiRequest(`/groups/${id}`, { method: "DELETE" }),
  addMember: (json) => apiRequest("/groups/members/add", { method: "POST", json }),
  removeMember: (json) => apiRequest("/groups/members/remove", { method: "POST", json }),
  sendMessage: (json) => apiRequest("/groups/messages", { method: "POST", json }),
  getMessages: (groupId, params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/groups/${groupId}/messages${query}`, { method: "GET" });
  },
  markMessageRead: (messageId) => apiRequest(`/groups/messages/${messageId}/read`, { method: "PUT" }),
};

export const paymentsApi = {
  create: (json) => apiRequest("/payments", { method: "POST", json }),
  initiate: (json) => apiRequest("/payments/initiate", { method: "POST", json }),
  list: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/payments${query}`, { method: "GET" });
  },
  get: (id) => apiRequest(`/payments/${id}`, { method: "GET" }),
  confirm: (json) => apiRequest("/payments/confirm", { method: "POST", json }),
  release: (json) => apiRequest("/payments/release", { method: "POST", json }),
  refund: (json) => apiRequest("/payments/refund", { method: "POST", json }),
};

export const notificationsApi = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/notifications${query}`, { method: "GET" });
  },
  getUnreadCount: () => apiRequest("/notifications/unread-count", { method: "GET" }),
  markRead: (notificationId) => apiRequest("/notifications/read", { method: "POST", json: { notificationId } }),
  markAllRead: () => apiRequest("/notifications/read-all", { method: "POST" }),
  delete: (id) => apiRequest(`/notifications/${id}`, { method: "DELETE" }),
  clearAll: () => apiRequest("/notifications/clear-all", { method: "DELETE" }),
};

export const listingsApi = {
  // Seller endpoints
  create: (json) => apiRequest("/seller/listings", { method: "POST", json }),
  update: (id, json) => apiRequest(`/seller/listings/${id}`, { method: "PUT", json }),
  delete: (id) => apiRequest(`/seller/listings/${id}`, { method: "DELETE" }),
  markAsSold: (id) => apiRequest(`/seller/listings/${id}/sold`, { method: "PUT" }),
  getMyListings: () => apiRequest("/seller/listings", { method: "GET" }),

  // Buyer endpoints
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/buyer/listings${query}`, { method: "GET", auth: false });
  },
  getById: (id) => apiRequest(`/buyer/listings/${id}`, { method: "GET", auth: false }),
  search: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/buyer/listings/search${query}`, { method: "GET", auth: false });
  },
  getNearby: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/buyer/listings/nearby${query}`, { method: "GET", auth: false });
  },
};

export const ordersApi = {
  create: (json) => apiRequest("/orders", { method: "POST", json }),
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/orders${query}`, { method: "GET" });
  },
  getById: (id) => apiRequest(`/orders/${id}`, { method: "GET" }),
  updateStatus: (id, json) => apiRequest(`/orders/${id}/status`, { method: "PUT", json }),
};

export const reviewsApi = {
  create: (json) => apiRequest("/reviews", { method: "POST", json }),
  getUserReviews: (userId, params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/reviews/user/${userId}${query}`, { method: "GET", auth: false });
  },
  getMyReviews: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/reviews/my-reviews${query}`, { method: "GET" });
  },
  getById: (id) => apiRequest(`/reviews/${id}`, { method: "GET", auth: false }),
  canReview: (orderId) => apiRequest(`/reviews/can-review/${orderId}`, { method: "GET" }),
};

export const cartApi = {
  addToCart: (json) => apiRequest("/cart", { method: "POST", json }),
  getCart: () => apiRequest("/cart", { method: "GET" }),
  updateItem: (json) => apiRequest("/cart", { method: "PUT", json }),
  removeItem: (listingId) => apiRequest(`/cart/${listingId}`, { method: "DELETE" }),
  clearCart: () => apiRequest("/cart/clear", { method: "DELETE" }),
  // Admin only
  getAllCarts: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return apiRequest(`/cart/all${query}`, { method: "GET" });
  },
  getCartByUser: (userId) => apiRequest(`/cart/user/${userId}`, { method: "GET" }),
};

export const adminApi = {
  // Dashboard
  getStats: () => apiRequest("/admin/stats", { method: "GET" }),
  getFraudAlerts: () => apiRequest("/admin/fraud-alerts", { method: "GET" }),

  // Users
  getUsers: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/admin/users${query}`, { method: "GET" });
  },
  getUserDetail: (id) => apiRequest(`/admin/users/${id}`, { method: "GET" }),
  banUser: (userId, reason) => apiRequest("/admin/users/ban", { method: "POST", json: { userId, reason } }),
  unbanUser: (userId) => apiRequest("/admin/users/unban", { method: "POST", json: { userId } }),
  promoteToAdmin: (userId) => apiRequest("/admin/users/promote", { method: "POST", json: { userId } }),
  changeUserRole: (userId, role) => apiRequest("/admin/users/role", { method: "POST", json: { userId, role } }),
  createAdmin: (json) => apiRequest("/admin/users/create-admin", { method: "POST", json }),

  // Listings
  getListings: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/admin/listings${query}`, { method: "GET" });
  },
  approveListing: (listingId) => apiRequest("/admin/listings/approve", { method: "POST", json: { listingId } }),
  rejectListing: (listingId) => apiRequest("/admin/listings/reject", { method: "POST", json: { listingId } }),
  deleteListing: (listingId) => apiRequest("/admin/listings/delete", { method: "POST", json: { listingId } }),

  // Orders
  getOrders: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/admin/orders${query}`, { method: "GET" });
  },
  forceOrderStatus: (orderId, status, reason) => apiRequest("/admin/orders/force-status", { method: "POST", json: { orderId, status, reason } }),

  // Payments
  getPayments: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/admin/payments${query}`, { method: "GET" });
  },
  releasePayment: (paymentId, reason) => apiRequest("/admin/payments/release", { method: "POST", json: { paymentId, reason } }),
  refundPayment: (paymentId, reason) => apiRequest("/admin/payments/refund", { method: "POST", json: { paymentId, reason } }),
  flagPayment: (paymentId, reason) => apiRequest("/admin/payments/flag", { method: "POST", json: { paymentId, reason } }),
  unflagPayment: (paymentId) => apiRequest("/admin/payments/unflag", { method: "POST", json: { paymentId } }),
  // Carts (admin view)
  getAllCarts: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/cart/all${query}`, { method: "GET" });
  },
};

export function storeSessionFromAuthResponse(body) {
  const { accessToken, refreshToken } = pickTokens(body);
  if (accessToken || refreshToken) setTokens({ accessToken, refreshToken });
}

export { BASE_URL, ACCESS_KEY };
