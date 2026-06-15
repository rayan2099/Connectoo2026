/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, ProviderSettings, MarketplaceSection, Call, Review, Report, ProviderVerification, Payment } from './types.js';
import { supabase } from './lib/supabase.js';

const API_BASE = '/api';

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email || '',
    username: row.username || '',
    fullName: row.full_name || row.fullName || '',
    avatar: row.avatar_url || row.avatar || '',
    bio: row.bio || '',
    role: row.role,
    approved: Boolean(row.approved),
    verified: Boolean(row.verified),
    banned: Boolean(row.banned),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

async function getProfileForUser(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

// Simple token storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('connectoo_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('connectoo_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('connectoo_token');
};


// Generic fetch wrapper with Bearer token
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = 'حصل خطأ ما أثناء الاتصال بالخادم';
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  signup: async (body: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          full_name: body.fullName,
          role: body.role,
          provider_type: body.providerType,
          bio: body.bio,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('لم نتمكن من إنشاء الحساب في Supabase');
    }

    if (!data.session?.access_token) {
      throw new Error('تم إنشاء الحساب. الرجاء تأكيد البريد الإلكتروني ثم تسجيل الدخول.');
    }

    const user = await getProfileForUser(data.user.id);
    return { user, token: data.session.access_token };
  },
  
  login: async (body: any) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!data.session?.access_token || !data.user) {
      throw new Error('تعذر فتح جلسة الدخول');
    }

    const user = await getProfileForUser(data.user.id);
    return { user, token: data.session.access_token };
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    clearAuthToken();
    return { success: true };
  },
  
  me: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      setAuthToken(sessionData.session.access_token);
    }

    return apiRequest<{ user: Profile }>('/auth/me');
  },

  // Marketplace
  getSections: () => apiRequest<MarketplaceSection[]>('/marketplace/sections'),
  
  getProviders: (filters: {
    providerType?: string;
    category?: string;
    specialty?: string;
    search?: string;
    onlineOnly?: boolean;
    language?: string;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.providerType) params.append('providerType', filters.providerType);
    if (filters.category) params.append('category', filters.category);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.search) params.append('search', filters.search);
    if (filters.onlineOnly) params.append('onlineOnly', 'true');
    if (filters.language) params.append('language', filters.language);

    return apiRequest<any[]>(`/marketplace/providers?${params.toString()}`);
  },

  matchProviders: (body: {
    prompt: string;
    providerType?: string;
    category?: string;
    onlineOnly?: boolean;
    language?: string;
  }) => apiRequest<{ providers: any[]; summary: string }>('/match/providers', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  
  getProviderProfile: (username: string) => apiRequest<any>(`/marketplace/providers/${username}`),

  // Provider Settings
  getProviderSettings: (userId: string) => apiRequest<ProviderSettings>(`/provider-settings/${userId}`),
  
  updateProviderSettings: (userId: string, body: any) => apiRequest<{ settings: ProviderSettings; user: Profile }>(`/provider-settings/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  }),

  // Calls
  createCall: (providerId: string) => apiRequest<Call>('/calls', {
    method: 'POST',
    body: JSON.stringify({ providerId })
  }),
  
  getCalls: () => apiRequest<Call[]>('/calls'),
  
  getCallById: (id: string) => apiRequest<Call>(`/calls/${id}`),
  
  updateCallStatus: (id: string, status: Call['status'], durationSeconds?: number) => apiRequest<Call>(`/calls/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, durationSeconds })
  }),

  // Agora Tokens
  getAgoraToken: (callId: string, channelName: string) => apiRequest<{ appId: string; token: string; channelName: string; uid: number }>('/agora/token', {
    method: 'POST',
    body: JSON.stringify({ callId, channelName })
  }),

  // Reviews
  submitReview: (body: { providerId: string; callId: string; rating: number; comment: string }) => apiRequest<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  
  getReviews: (providerId: string) => apiRequest<Review[]>(`/providers/${providerId}/reviews`),

  // Safety Reporting & Blocking
  reportUser: (reportedId: string, reason: string) => apiRequest<any>('/safety/report', {
    method: 'POST',
    body: JSON.stringify({ reportedId, reason })
  }),
  
  blockUser: (blockedId: string) => apiRequest<any>('/safety/block', {
    method: 'POST',
    body: JSON.stringify({ blockedId })
  }),

  // Expert Verification Request
  submitVerification: (body: { profession: string; jurisdiction: string; licenseNumber: string; notes?: string }) => apiRequest<ProviderVerification>('/provider/verify', {
    method: 'POST',
    body: JSON.stringify(body)
  }),

  // Admin

  getAdminUsers: () => apiRequest<Profile[]>('/admin/users'),
  
  approveUser: (id: string) => apiRequest<Profile>(`/admin/users/${id}/approve`, { method: 'PATCH' }),
  
  rejectUser: (id: string) => apiRequest<any>(`/admin/users/${id}/reject`, { method: 'DELETE' }),
  
  banUser: (id: string, ban: boolean) => apiRequest<Profile>(`/admin/users/${id}/ban`, {
    method: 'PATCH',
    body: JSON.stringify({ ban })
  }),
  
  getAdminReports: () => apiRequest<any[]>('/admin/reports'),
  
  deleteReport: (id: string) => apiRequest<any>(`/admin/reports/${id}`, { method: 'DELETE' }),
  
  getAdminVerifications: () => apiRequest<ProviderVerification[]>('/admin/verifications'),
  
  approveVerification: (id: string) => apiRequest<ProviderVerification>(`/admin/verifications/${id}/approve`, { method: 'PATCH' }),
  
  rejectVerification: (id: string) => apiRequest<ProviderVerification>(`/admin/verifications/${id}/reject`, { method: 'PATCH' }),
  
  getAdminAnalytics: () => apiRequest<any>('/admin/analytics')
};
