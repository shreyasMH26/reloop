/**
 * ReLoop Universal API Client
 * Seamlessly interfaces with the Express REST API via Vite proxy or direct URL.
 * Automatically injects JWT Bearer tokens and handles auth persistence.
 */

const API_BASE = '/api';

export const TOKEN_STORAGE_KEY = 'reloop_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to access localStorage', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = isJson && data.error ? data.error : response.statusText || 'Request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────

export const api = {
  // Auth
  auth: {
    async register(payload: { email: string; password: string; full_name: string; area?: string; phone?: string; bio?: string }) {
      const res = await request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(res.token);
      return res;
    },
    async login(payload: { email: string; password: string }) {
      const res = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(res.token);
      return res;
    },
    async getMe() {
      return request<{ user: any }>('/auth/me');
    },
    async updateProfile(updates: any) {
      return request<{ message: string; user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async forgotPassword(email: string) {
      return request<{ message: string; devToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    async resetPassword(token: string, new_password: string) {
      return request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password }),
      });
    },
    logout() {
      setStoredToken(null);
    },
  },

  // Categories
  categories: {
    async list() {
      return request<any[]>('/categories');
    },
  },

  // Products
  products: {
    async list(filters?: {
      q?: string;
      category?: string;
      condition?: string;
      type?: string;
      area?: string;
      minPrice?: number | string;
      maxPrice?: number | string;
      sort?: string;
      seller_id?: string;
      limit?: number;
      offset?: number;
    }) {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            params.append(key, String(val));
          }
        });
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<{ total: number; items: any[] }>(`/products${qs}`);
    },
    async getById(id: string) {
      return request<any>(`/products/${id}`);
    },
    async getFeatured() {
      return request<any[]>('/products/featured');
    },
    async getTrending() {
      return request<any[]>('/products/trending');
    },
    async getNearby(area?: string) {
      const qs = area ? `?area=${encodeURIComponent(area)}` : '';
      return request<any[]>(`/products/nearby${qs}`);
    },
    async create(productData: any) {
      return request<{ message: string; product: any }>('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },
    async update(id: string, updates: any) {
      return request<{ message: string; product: any }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string) {
      return request<{ message: string }>(`/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Wishlist
  wishlist: {
    async list() {
      return request<any[]>('/wishlist');
    },
    async toggle(productId: string) {
      return request<{ saved: boolean }>(`/wishlist/${productId}/toggle`, {
        method: 'POST',
      });
    },
  },

  // Purchase Requests & Rentals & Exchanges
  requests: {
    async create(data: {
      product_id: string;
      request_type: 'buy' | 'rent' | 'exchange';
      offered_price?: number;
      message?: string;
      rental_start_date?: string | null;
      rental_end_date?: string | null;
      exchange_item_title?: string | null;
      exchange_item_image?: string | null;
      exchange_cash_diff?: number;
    }) {
      return request<{ message: string; request: any }>('/purchase-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getIncoming() {
      return request<any[]>('/purchase-requests/incoming');
    },
    async getOutgoing() {
      return request<any[]>('/purchase-requests/outgoing');
    },
    async updateStatus(id: string, status: string) {
      return request<{ message: string; request: any }>(`/purchase-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // Orders
  orders: {
    async list() {
      return request<{ all: any[]; purchases: any[]; sales: any[] }>('/orders');
    },
  },

  // Conversations & Messages
  conversations: {
    async list() {
      return request<any[]>('/conversations');
    },
    async getMessages(conversationId: string) {
      return request<any[]>(`/conversations/${conversationId}/messages`);
    },
    async sendMessage(receiver_id: string, content: string, product_id?: string) {
      return request<{ conversation_id: string; message: any }>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ receiver_id, content, product_id }),
      });
    },
  },

  // Reports
  reports: {
    async create(data: { reported_type: 'product' | 'user' | 'message'; reported_id: string; reason: string; details?: string }) {
      return request<{ message: string; report: any }>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Sustainability
  sustainability: {
    async getMetrics() {
      return request<{
        total_items_reused: number;
        co2_saved_kg: number;
        water_saved_liters: number;
        ewaste_diverted_kg: number;
        money_saved_rupees: number;
        active_members: number;
        trees_equivalent: number;
      }>('/sustainability');
    },
    async getLeaderboard() {
      return request<{ leaderboard: any[] }>('/sustainability/leaderboard');
    },
    async getCategories() {
      return request<{ categories: any[] }>('/sustainability/categories');
    },
  },

  // Reviews & Community Trust
  reviews: {
    async getUserReviews(userId: string) {
      return request<{ reviews: any[] }>(`/reviews/user/${userId}`);
    },
    async create(data: { order_id: string; rating: number; comment: string }) {
      return request<{ message: string; review: any }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Real-time Notifications
  notifications: {
    async list() {
      return request<{ notifications: any[]; unread_count: number }>('/notifications');
    },
    async getUnreadCount() {
      return request<{ unread_count: number }>('/notifications/unread-count');
    },
    async markAsRead(id: string) {
      return request<{ message: string; notification: any }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
    async markAllAsRead() {
      return request<{ message: string }>('/notifications/read-all', {
        method: 'PATCH',
      });
    },
  },

  // Admin Moderation Suite
  admin: {
    async getMetrics() {
      return request<{ metrics: any }>('/admin/metrics');
    },
    async getUsers() {
      return request<{ users: any[] }>('/admin/users');
    },
    async updateUserStatus(id: string, data: { is_suspended?: boolean; is_verified?: boolean; role?: string; reason?: string }) {
      return request<{ message: string; user: any }>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    async getListings() {
      return request<{ listings: any[] }>('/admin/listings');
    },
    async updateListingStatus(id: string, data: { status: string; reason?: string }) {
      return request<{ message: string; listing: any }>(`/admin/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    async getReports(status = 'all') {
      return request<{ reports: any[] }>(`/admin/reports?status=${status}`);
    },
    async actionReport(id: string, data: { status: string; moderator_notes?: string; action_taken?: string }) {
      return request<{ message: string; report: any }>(`/admin/reports/${id}/action`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    async getLogs() {
      return request<{ logs: any[] }>('/admin/logs');
    },
  },

  // Image Upload
  upload: {
    async uploadImage(base64Data: string) {
      return request<{ url: string; size?: number }>('/upload', {
        method: 'POST',
        body: JSON.stringify({ data: base64Data }),
      });
    },
  },
};
