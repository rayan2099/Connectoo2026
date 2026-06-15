/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, ProviderSettings, MarketplaceSection, Call, Review, Report, ProviderVerification, Payment } from './types.js';

const API_BASE = '/api';

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
  signup: (body: any) => apiRequest<{ user: Profile; token: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  
  login: (body: any) => apiRequest<{ user: Profile; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  
  logout: () => {
    clearAuthToken();
    return apiRequest('/auth/logout', { method: 'POST' });
  },
  
  me: () => apiRequest<{ user: Profile }>('/auth/me'),

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
