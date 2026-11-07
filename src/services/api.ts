import { User, SwapRequest, Conversation, Message, NotificationItem, ExchangeRecord } from '../types';

const TOKEN_KEY = 'skillswap_auth_token';
const USER_KEY = 'skillswap_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; location: string }) =>
    request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string; devResetToken?: string; instructions?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Users & Browse
  getUsers: (params?: { search?: string; category?: string; level?: string; location?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.level) query.set('level', params.level);
    if (params?.location) query.set('location', params.location);
    const qs = query.toString();
    return request<{ users: User[]; count: number }>(`/api/users${qs ? `?${qs}` : ''}`);
  },

  getUserById: (id: string) => request<{ user: User }>(`/api/users/${id}`),

  getCategories: () => request<{ categories: { name: string; count: number }[] }>('/api/skills/categories'),

  // Profile Management
  updateProfile: (profileData: any) =>
    request<{ message: string; user: User }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  // Swap Requests
  getSwapRequests: (tab?: 'received' | 'sent' | 'accepted') =>
    request<{ requests: SwapRequest[] }>(`/api/swaps/requests${tab ? `?tab=${tab}` : ''}`),

  createSwapRequest: (data: { receiverId: string; offeredSkill: string; requestedSkill: string; message: string }) =>
    request<{ message: string; request: SwapRequest }>('/api/swaps/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  acceptSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest; conversationId: string }>(`/api/swaps/requests/${id}/accept`, {
      method: 'POST'
    }),

  rejectSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest }>(`/api/swaps/requests/${id}/reject`, {
      method: 'POST'
    }),

  cancelSwapRequest: (id: string) =>
    request<{ message: string; request: SwapRequest }>(`/api/swaps/requests/${id}/cancel`, {
      method: 'POST'
    }),

  // Conversations & Chat
  getConversations: () => request<{ conversations: Conversation[] }>('/api/conversations'),

  getMessages: (conversationId: string) =>
    request<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string, meeting?: any) =>
    request<{ message: Message }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, meeting })
    }),

  // AI Skill Assistant
  askAI: (prompt: string, conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []) =>
    request<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, conversationHistory })
    }),

  // Notifications
  getNotifications: () => request<{ notifications: NotificationItem[] }>('/api/notifications'),
  markNotificationsRead: () => request<{ message: string }>('/api/notifications/read-all', { method: 'PUT' }),

  // Exchanges
  getExchanges: () => request<{ exchanges: ExchangeRecord[] }>('/api/exchanges'),
  completeExchange: (id: string, data: { rating: number; review: string }) =>
    request<{ message: string; exchange: ExchangeRecord }>(`/api/exchanges/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Dashboard Stats
  getDashboardStats: () =>
    request<{
      stats: {
        skillsOffered: number;
        skillsWanted: number;
        sentRequestsCount: number;
        receivedRequestsCount: number;
        acceptedExchangesCount: number;
        unreadMessagesCount: number;
        exchangesCompletedCount: number;
      };
      recentRequests: SwapRequest[];
      smartMatches: {
        user: User;
        matchScore: number;
        matchingOffers: string[];
        matchingWants: string[];
        reason: string;
      }[];
    }>('/api/stats'),

  // Settings
  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    })
};
