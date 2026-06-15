import { supabase } from './lib/supabase';
import { Profile, ProviderSettings, MarketplaceSection, Call, Review, Report, ProviderVerification } from './types';

const API_BASE = '/api';

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email || '',
    username: row.username,
    fullName: row.full_name,
    avatar: row.avatar_url || '',
    bio: row.bio || '',
    role: row.role,
    approved: row.approved,
    verified: row.verified,
    banned: row.banned,
    createdAt: row.created_at,
  };
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('connectoo_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('connectoo_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('connectoo_token');
};

async function getCurrentProfile(): Promise<Profile | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (error) throw error;
  return mapProfile(data);
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token || getAuthToken();

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
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
  signup: async (body: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    role: 'client' | 'provider';
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          role: body.role,
          username: body.username,
          full_name: body.fullName,
        },
      },
    });

    if (error) throw error;

    const user = await getCurrentProfile();
    if (!user) throw new Error('تم إنشاء الحساب، الرجاء تأكيد البريد ثم تسجيل الدخول');

    const token = data.session?.access_token || '';
    if (token) setAuthToken(token);

    return { user, token };
  },

  login: async (body: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) throw error;

    const user = await getCurrentProfile();
    if (!user) throw new Error('لم يتم العثور على ملف المستخدم');

    const token = data.session.access_token;
    setAuthToken(token);

    return { user, token };
  },

  logout: async () => {
    clearAuthToken();
    await supabase.auth.signOut();
    return { success: true };
  },

  me: async () => {
    const user = await getCurrentProfile();
    if (!user) throw new Error('غير مسجل الدخول');
    return { user };
  },

  getSections: async () => {
    const { data, error } = await supabase
      .from('marketplace_sections')
      .select('*, marketplace_subsections(*)')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map((section: any) => ({
      id: section.id,
      slug: section.slug,
      providerType: section.provider_type,
      labelAr: section.label_ar,
      labelEn: section.label_en,
      descriptionAr: section.description_ar,
      sortOrder: section.sort_order,
      active: section.active,
      subsections: (section.marketplace_subsections || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((sub: any) => ({
          id: sub.id,
          sectionId: sub.section_id,
          slug: sub.slug,
          labelAr: sub.label_ar,
          labelEn: sub.label_en,
          sortOrder: sub.sort_order,
          active: sub.active,
        })),
    }));
  },

  getProviders: async (filters: {
    providerType?: string;
    category?: string;
    specialty?: string;
    search?: string;
    onlineOnly?: boolean;
    language?: string;
  } = {}) => {
    let query = supabase
      .from('provider_settings')
      .select('*, profiles!inner(*)')
      .eq('profiles.role', 'provider')
      .eq('profiles.approved', true)
      .eq('profiles.banned', false);

    if (filters.providerType) query = query.eq('provider_type', filters.providerType);
    if (filters.category) query = query.eq('category_slug', filters.category);
    if (filters.specialty) query = query.contains('specialty_slugs', [filters.specialty]);
    if (filters.onlineOnly) query = query.eq('availability_status', 'online');
    if (filters.language) query = query.contains('languages', [filters.language]);

    const { data, error } = await query;
    if (error) throw error;

    let providers = (data || []).map((row: any) => {
      const profile = row.profiles;
      return {
        id: profile.id,
        email: profile.email || '',
        username: profile.username,
        fullName: profile.full_name,
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        role: profile.role,
        approved: profile.approved,
        verified: profile.verified,
        banned: profile.banned,
        createdAt: profile.created_at,
        settings: {
          id: row.id,
          userId: row.user_id,
          providerType: row.provider_type,
          availabilityStatus: row.availability_status,
          categorySlug: row.category_slug,
          specialtySlugs: row.specialty_slugs || [],
          languages: row.languages || ['العربية'],
          pricePerMinute: Number(row.price_per_minute || 0),
          updatedAt: row.updated_at,
        },
        avgRating: 5,
        reviewsCount: 0,
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      providers = providers.filter((provider: any) =>
        provider.fullName.toLowerCase().includes(q) ||
        provider.username.toLowerCase().includes(q) ||
        provider.bio.toLowerCase().includes(q)
      );
    }

    return providers;
  },

  getProviderProfile: (username: string) => apiRequest<any>(`/marketplace/providers/${username}`),

  getProviderSettings: (userId: string) => apiRequest<ProviderSettings>(`/provider-settings/${userId}`),

  updateProviderSettings: (userId: string, body: any) =>
    apiRequest<{ settings: ProviderSettings; user: Profile }>(`/provider-settings/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  createCall: (providerId: string) =>
    apiRequest<Call>('/calls', {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    }),

  getCalls: () => apiRequest<Call[]>('/calls'),

  getCallById: (id: string) => apiRequest<Call>(`/calls/${id}`),

  updateCallStatus: (id: string, status: Call['status'], durationSeconds?: number) =>
    apiRequest<Call>(`/calls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, durationSeconds }),
    }),

  getAgoraToken: (callId: string, channelName: string) =>
    apiRequest<{ appId: string; token: string; channelName: string; uid: number }>('/agora/token', {
      method: 'POST',
      body: JSON.stringify({ callId, channelName }),
    }),

  submitReview: (body: { providerId: string; callId: string; rating: number; comment: string }) =>
    apiRequest<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getReviews: (providerId: string) => apiRequest<Review[]>(`/providers/${providerId}/reviews`),

  reportUser: (reportedId: string, reason: string) =>
    apiRequest<any>('/safety/report', {
      method: 'POST',
      body: JSON.stringify({ reportedId, reason }),
    }),

  blockUser: (blockedId: string) =>
    apiRequest<any>('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ blockedId }),
    }),

  submitVerification: (body: { profession: string; jurisdiction: string; licenseNumber: string; notes?: string }) =>
    apiRequest<ProviderVerification>('/provider/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAdminUsers: () => apiRequest<Profile[]>('/admin/users'),

  approveUser: (id: string) => apiRequest<Profile>(`/admin/users/${id}/approve`, { method: 'PATCH' }),

  rejectUser: (id: string) => apiRequest<any>(`/admin/users/${id}/reject`, { method: 'DELETE' }),

  banUser: (id: string, ban: boolean) =>
    apiRequest<Profile>(`/admin/users/${id}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ ban }),
    }),

  getAdminReports: () => apiRequest<Report[]>('/admin/reports'),

  deleteReport: (id: string) => apiRequest<any>(`/admin/reports/${id}`, { method: 'DELETE' }),

  getAdminVerifications: () => apiRequest<ProviderVerification[]>('/admin/verifications'),

  approveVerification: (id: string) =>
    apiRequest<ProviderVerification>(`/admin/verifications/${id}/approve`, { method: 'PATCH' }),

  rejectVerification: (id: string) =>
    apiRequest<ProviderVerification>(`/admin/verifications/${id}/reject`, { method: 'PATCH' }),

  getAdminAnalytics: () => apiRequest<any>('/admin/analytics'),
};
