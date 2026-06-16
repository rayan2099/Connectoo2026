/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Circle, Shield, ShieldAlert, Search, Star, 
  User, Settings, LogOut, CheckCircle2, AlertTriangle, Heart, DollarSign, 
  Globe, SlidersHorizontal, Filter, Clock, Plus, X, Menu, Users, Flag, 
  Lock, Unlock, MessageSquare, TrendingUp, BarChart3, Settings2, Sparkles, Building, Check, ArrowRight, Activity
} from 'lucide-react';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './api.js';
import { Profile, ProviderSettings, MarketplaceSection, Call, Review, Report, ProviderVerification, MARKETPLACE_SECTIONS_DATA } from './types.js';
import ExpertDisclaimer from './components/ExpertDisclaimer.js';
import ProviderCard from './components/ProviderCard.js';
import AudioVisualizer from './components/AudioVisualizer.js';

type ViewState = 'landing' | 'auth' | 'marketplace' | 'profile' | 'provider_dashboard' | 'call' | 'call_summary' | 'settings' | 'admin' | 'pending_approval';

export default function App() {
  // Navigation Router state
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentProviderUsername, setCurrentProviderUsername] = useState<string | null>(null);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupRole, setSignupRole] = useState<'client' | 'provider'>('client');
  const [signupRolePreset, setSignupRolePreset] = useState(false);
  const [showProviderSignupOptions, setShowProviderSignupOptions] = useState(false);
  const [landingPreviewFilter, setLandingPreviewFilter] = useState('all');
  const [selectedLandingPreviewCard, setSelectedLandingPreviewCard] = useState<any | null>(null);
  const [showPreviewSigninPrompt, setShowPreviewSigninPrompt] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Marketplace filter states
  const [currentMarketplaceTab, setCurrentMarketplaceTab] = useState<'creator' | 'expert'>('creator');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [needPrompt, setNeedPrompt] = useState<string>('');
  const [matchHint, setMatchHint] = useState<string | null>(null);
  const [smartMatchMode, setSmartMatchMode] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  
  // Dynamic list states
  const [sections, setSections] = useState<MarketplaceSection[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [activeProfileReviews, setActiveProfileReviews] = useState<Review[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  
  // Call States
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState<boolean>(false);
  const [incomingCallRequest, setIncomingCallRequest] = useState<Call | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [showCallSigninPrompt, setShowCallSigninPrompt] = useState(false);

  // Review Form state after calling
  const [summaryCall, setSummaryCall] = useState<Call | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Safety Action dialogs
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Settings states
  const [settingsFullName, setSettingsFullName] = useState('');
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsAvatar, setSettingsAvatar] = useState('');
  const [settingsProviderType, setSettingsProviderType] = useState<'creator' | 'expert'>('creator');
  const [settingsCategory, setSettingsCategory] = useState('');
  const [settingsSpecialties, setSettingsSpecialties] = useState<string[]>([]);
  const [settingsPrice, setSettingsPrice] = useState<number>(10);
  const [settingsLanguages, setSettingsLanguages] = useState<string[]>(['العربية']);
  const [settingsAvailability, setSettingsAvailability] = useState<ProviderSettings['availabilityStatus']>('offline');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [verificationProfession, setVerificationProfession] = useState('');
  const [verificationJurisdiction, setVerificationJurisdiction] = useState('');
  const [verificationLicense, setVerificationLicense] = useState('');
  const [verificationSavedMsg, setVerificationSavedMsg] = useState<string | null>(null);

  // Admin section states
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [adminReports, setAdminReports] = useState<Report[]>([]);
  const [adminVerifications, setAdminVerifications] = useState<ProviderVerification[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'approvals' | 'verifications' | 'reports' | 'analytics'>('approvals');
  const [adminLoading, setAdminLoading] = useState(false);

  // Intervals and timers refs
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchIntervalsRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initial Check and Session Restore ---
  useEffect(() => {
    // Sync catalog sections
    api.getSections().then(data => {
      setSections(data);
    }).catch(err => console.error(err));

    // Restore login
    const token = getAuthToken();
    if (token) {
      api.me().then(res => {
        if (res.user) {
          setCurrentUser(res.user);
          // If approved click user to dashboard or search
          if (!res.user.approved && res.user.role === 'provider') {
            setCurrentView('pending_approval');
          } else if (res.user.role === 'admin') {
            setCurrentView('admin');
          } else if (res.user.role === 'provider') {
            setCurrentView('provider_dashboard');
          } else {
            setCurrentView('marketplace');
          }
        }
      }).catch(() => {
        clearAuthToken();
        setCurrentView('landing');
      });
    }
  }, []);

  // Set default settings value when user state is ready
  useEffect(() => {
    if (currentUser) {
      setSettingsFullName(currentUser.fullName || '');
      setSettingsBio(currentUser.bio || '');
      setSettingsAvatar(currentUser.avatar || '');
      
      if (currentUser.role === 'provider') {
        api.getProviderSettings(currentUser.id).then(settings => {
          if (settings) {
            setSettingsProviderType(settings.providerType || 'creator');
            setSettingsCategory(settings.categorySlug || 'creators-celebrities');
            setSettingsSpecialties(settings.specialtySlugs || []);
            setSettingsPrice(settings.pricePerMinute || 10);
            setSettingsLanguages(settings.languages || ['العربية']);
            setSettingsAvailability(settings.availabilityStatus || 'offline');
          }
        }).catch(err => console.error(err));
      }
    }
  }, [currentUser]);

  // --- Background Polling for voice marketplace ring state ---
  useEffect(() => {
    // Setup background poller
    if (!currentUser) return;

    const interval = setInterval(() => {
      // 1. If I am a Provider -> poll for any ringing call requests
      if (currentUser.role === 'provider' && !activeCall && !incomingCallRequest) {
        // Also check if they are online
        api.getCalls().then(allCalls => {
          const ringingCall = allCalls.find(
            c => c.providerId === currentUser.id && c.status === 'ringing'
          );
          if (ringingCall) {
            setIncomingCallRequest(ringingCall);
            // play simple call beep here or show screen
          }
        }).catch(err => console.error('Error polling call rings:', err));
      }

      // 2. If I am a Client and have an outgoing call -> poll for provider decision
      if (currentUser.role === 'client' && activeCall && activeCall.status === 'ringing') {
        api.getCallById(activeCall.id).then(refreshedCall => {
          if (refreshedCall.status === 'active') {
            // Provider accepted!
            setActiveCall(refreshedCall);
            startCallTimer();
          } else if (refreshedCall.status === 'rejected') {
            // Provider rejected!
            setActiveCall(null);
            setCallError('تم رفض المكالمة من قبل مقدم الخدمة.');
            setTimeout(() => setCallError(null), 5000);
          } else if (refreshedCall.status === 'completed' || refreshedCall.status === 'missed') {
            setActiveCall(null);
          }
        }).catch(err => console.error('Error updating client call poll:', err));
      }

      // 3. If I am pending approval -> poll auth status
      if (currentView === 'pending_approval') {
        api.me().then(res => {
          if (res.user && res.user.approved) {
            setCurrentUser(res.user);
            setCurrentView(res.user.role === 'provider' ? 'provider_dashboard' : 'marketplace');
          }
        }).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser, activeCall, incomingCallRequest, currentView]);

  // --- Poll providers and active profiles ---
  useEffect(() => {
    if (currentView === 'marketplace' && !smartMatchMode) {
      loadMarketplaceProviders();
    }
  }, [currentView, currentMarketplaceTab, selectedCategory, selectedSpecialty, searchQuery, onlineOnly, selectedLanguage, smartMatchMode]);

  const loadMarketplaceProviders = () => {
    setLoadingProviders(true);
    api.getProviders({
      providerType: currentMarketplaceTab,
      category: selectedCategory,
      specialty: selectedSpecialty,
      search: searchQuery,
      onlineOnly,
      language: selectedLanguage
    }).then(res => {
      setProviders(res);
      setLoadingProviders(false);
    }).catch(err => {
      console.error(err);
      setLoadingProviders(false);
    });
  };

  // --- Active Call Screen Stopwatches ---
  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallTimer(0);
    callTimerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Actions & Triggers ---
  
  // Signup Flow
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (!authEmail || !authPassword || !authUsername || !authFullName) {
        throw new Error('يرجى كتابة كافة البيانات المطلوبة لإنشاء الحساب');
      }

      const res = await api.signup({
        email: authEmail,
        password: authPassword,
        username: authUsername,
        fullName: authFullName,
        role: signupRole,
        providerType: signupRole === 'provider' ? settingsProviderType : undefined,
        bio: signupRole === 'provider' ? authBio : undefined
      });

      setAuthToken(res.token);
      setCurrentUser(res.user);

      // Check if approved (clients are approved instantly, providers go to evaluation)
      if (signupRole === 'provider') {
        setCurrentView('pending_approval');
      } else {
        setCurrentView('marketplace');
      }

      // Reset
      resetAuthForm();
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Login Flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (!authEmail || !authPassword) {
        throw new Error('يرجى تعبئة البريد الإلكتروني وكلمة المرور');
      }

      const res = await api.login({ email: authEmail, password: authPassword });
      setAuthToken(res.token);
      setCurrentUser(res.user);

      if (res.user.role === 'admin') {
        setCurrentView('admin');
        loadAdminData();
      } else if (res.user.role === 'provider') {
        if (!res.user.approved) {
          setCurrentView('pending_approval');
        } else {
          setCurrentView('provider_dashboard');
        }
      } else {
        setCurrentView('marketplace');
      }

      resetAuthForm();
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout().then(() => {
      setCurrentUser(null);
      setCurrentView('landing');
    }).catch(() => {
      setCurrentUser(null);
      setCurrentView('landing');
    });
  };

  const resetAuthForm = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthUsername('');
    setAuthFullName('');
    setAuthBio('');
    setAuthError(null);
    setSignupRolePreset(false);
    setShowProviderSignupOptions(false);
  };

  // Navigation Shortcut for landing CTAs
  const navigateToSignup = (role: 'client' | 'provider') => {
    setSignupRole(role);
    setSignupRolePreset(true);
    setAuthMode('signup');
    setCurrentView('auth');
  };

  const navigateToProviderSignup = (providerType: 'creator' | 'expert') => {
    setSettingsProviderType(providerType);
    setSettingsCategory(providerType === 'creator' ? 'creators-celebrities' : 'legal');
    navigateToSignup('provider');
  };

  // Start outgoing call
  const triggerCallToProvider = async (providerId: string) => {
    if (!currentUser) {
      setShowCallSigninPrompt(true);
      return;
    }

    try {
      setCallError(null);
      const call = await api.createCall(providerId);
      setActiveCall(call);
      setCurrentView('call');
      // ringing phase begins!
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Provider decisions on incoming ringer
  const handleAcceptCall = async () => {
    if (!incomingCallRequest) return;
    try {
      const call = await api.updateCallStatus(incomingCallRequest.id, 'active');
      setActiveCall(call);
      setIncomingCallRequest(null);
      setCurrentView('call');
      startCallTimer();
    } catch (err: any) {
      alert(err.message);
      setIncomingCallRequest(null);
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCallRequest) return;
    try {
      await api.updateCallStatus(incomingCallRequest.id, 'rejected');
      setIncomingCallRequest(null);
    } catch (err) {
      setIncomingCallRequest(null);
    }
  };

  // End active call
  const handleHangUp = async () => {
    if (!activeCall) return;
    stopCallTimer();
    try {
      // Send completed status with calculated timer, will register platform fees
      const updated = await api.updateCallStatus(activeCall.id, 'completed', callTimer);
      
      // Save for summary
      setSummaryCall(updated);
      setActiveCall(null);
      
      // Clear forms
      setReviewRating(5);
      setReviewComment('');
      
      // Move to summary page
      setCurrentView('call_summary');
    } catch (err: any) {
      setActiveCall(null);
      setCurrentView('marketplace');
    }
  };

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryCall) return;
    setSubmittingReview(true);

    try {
      await api.submitReview({
        providerId: summaryCall.providerId,
        callId: summaryCall.id,
        rating: reviewRating,
        comment: reviewComment
      });

      // Done, clear and return
      setSummaryCall(null);
      setCurrentView('marketplace');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Block & Report APIs
  const handleBlockProvider = async (blockedId: string) => {
    if (!window.confirm('هل أنت متأكد من حظر هذا الشخص؟ لن يتمكن من التواصل معك مجدداً.')) return;
    try {
      await api.blockUser(blockedId);
      alert('تم حظر المستخدم بنجاح.');
      setCurrentView('marketplace');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReportProvider = async () => {
    if (!activeProfile || !reportReason.trim()) return;
    try {
      await api.reportUser(activeProfile.id, reportReason);
      alert('تم إرسال البلاغ لمراجعة الإدارة للتحقق من الموقف.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Settings Flow
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsSavedMsg(null);

    try {
      const payload: any = {
        fullName: settingsFullName,
        bio: settingsBio,
        avatar: settingsAvatar
      };

      if (currentUser.role === 'provider') {
        payload.providerType = settingsProviderType;
        payload.categorySlug = settingsCategory;
        payload.specialtySlugs = settingsSpecialties;
        payload.languages = settingsLanguages;
        payload.pricePerMinute = settingsPrice;
        payload.availabilityStatus = settingsAvailability;
      }

      const res = await api.updateProviderSettings(currentUser.id, payload);
      setCurrentUser(res.user);
      setSettingsSavedMsg('تم حفظ البيانات والتعديلات بنجاح!');
      setTimeout(() => setSettingsSavedMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit documentation for verification (Expert status)
  const handleVerifyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationSavedMsg(null);
    try {
      if (!verificationProfession || !verificationJurisdiction || !verificationLicense) {
        throw new Error('يرجى استكمال جميع البيانات الأساسية لترخيص المهنة');
      }

      await api.submitVerification({
        profession: verificationProfession,
        jurisdiction: verificationJurisdiction,
        licenseNumber: verificationLicense,
        notes: 'طلب فحص أوراق مع تقديم نسخة رقمية.'
      });

      setVerificationSavedMsg('تم إرسال ملف التحقق الخاص بك للمشرفين، وسيتم تفعيل شارة التوثيق بمجرد الاعتماد.');
      setVerificationProfession('');
      setVerificationJurisdiction('');
      setVerificationLicense('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // View individual Profile
  const handleViewProfile = async (username: string) => {
    try {
      const data = await api.getProviderProfile(username);
      setActiveProfile(data);
      setActiveProfileReviews(data.reviews || []);
      setCurrentView('profile');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle availability from provider desk shortcut
  const handleProviderToggleStatus = async (status: 'online' | 'offline' | 'busy') => {
    if (!currentUser) return;
    try {
      setSettingsAvailability(status);
      await api.updateProviderSettings(currentUser.id, { availabilityStatus: status });
      // update state
      const updatedUser = { ...currentUser };
      setCurrentUser(updatedUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Admin Panel Loader
  const loadAdminData = async () => {

    setAdminLoading(true);
    try {
      const [users, reports, verifications, analytics] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAdminVerifications(),
        api.getAdminAnalytics()
      ]);
      setAdminUsers(users);
      setAdminReports(reports);
      setAdminVerifications(verifications);
      setAdminAnalytics(analytics);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const openAdminDashboard = () => {
    setCurrentView('admin');
    loadAdminData();
  };

  // Admin user approvals / actions
  const handleAdminApproveUser = async (id: string) => {
    try {
      await api.approveUser(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminRejectUser = async (id: string) => {
    if (!window.confirm('هل تريد رفض الطلب طلب هذا المستخدم؟')) return;
    try {
      await api.rejectUser(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminBanToggle = async (userId: string, isCurrentlyBanned: boolean) => {
    try {
      await api.banUser(userId, !isCurrentlyBanned);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminApproveVerify = async (id: string) => {
    try {
      await api.approveVerification(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminRejectVerify = async (id: string) => {
    try {
      await api.rejectVerification(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminDeleteReport = async (id: string) => {
    try {
      await api.deleteReport(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleSpecialty = (slug: string) => {
    if (settingsSpecialties.includes(slug)) {
      setSettingsSpecialties(prev => prev.filter(s => s !== slug));
    } else {
      setSettingsSpecialties(prev => [...prev, slug]);
    }
  };

  const handleSmartMatch = async () => {
    const text = needPrompt.trim();
    if (!text) return;

    const normalized = text.toLowerCase();
    const matchGroups = [
      {
        tab: 'creator' as const,
        category: 'creators-celebrities',
        hint: 'بحثنا لك بين المشاهير والمؤثرين بناءً على وصفك.',
        keywords: ['مشهور', 'مؤثر', 'فنان', 'لاعب', 'يوتيوبر', 'ستريمر', 'تهنئة', 'معجب', 'بودكاست', 'رياضة', 'موسيقى']
      },
      {
        tab: 'expert' as const,
        category: 'legal',
        hint: 'يبدو أن موقفك قانوني، لذلك عرضنا خبراء القانون والطوارئ أولاً.',
        keywords: ['قانون', 'محامي', 'شرطة', 'مضاربة', 'مشكلة', 'قضية', 'عقد', 'بلاغ', 'حادث', 'حقوق', 'مخالفة', 'سجن']
      },
      {
        tab: 'expert' as const,
        category: 'medical-guidance',
        hint: 'يبدو أنك تحتاج إرشاداً صحياً أو دوائياً، لذلك عرضنا المختصين الأقرب.',
        keywords: ['دواء', 'صيدلي', 'طبيب', 'ألم', 'حرارة', 'طفل', 'جلد', 'حساسية', 'أعراض', 'مريض', 'علاج']
      },
      {
        tab: 'expert' as const,
        category: 'emotional-support',
        hint: 'يبدو أنك تحتاج دعماً نفسياً أو عاطفياً، لذلك عرضنا المختصين الأقرب.',
        keywords: ['قلق', 'توتر', 'خوف', 'اكتئاب', 'انفصال', 'علاقة', 'زعل', 'ضغط', 'نفسية', 'وحدة']
      },
      {
        tab: 'expert' as const,
        category: 'tech-support',
        hint: 'يبدو أن احتياجك تقني، لذلك عرضنا خبراء التقنية والحسابات.',
        keywords: ['حساب', 'تهكر', 'مخترق', 'لابتوب', 'جوال', 'راوتر', 'انترنت', 'برمجة', 'موقع', 'تطبيق', 'ذكاء اصطناعي']
      },
      {
        tab: 'expert' as const,
        category: 'home-car',
        hint: 'يبدو أن احتياجك متعلق بالمنزل أو السيارة، لذلك عرضنا المختصين المناسبين.',
        keywords: ['سيارة', 'مكينة', 'بطارية', 'كفر', 'مكيف', 'كهرباء', 'سباكة', 'بيت', 'منزل', 'عطل', 'ميكانيكي']
      },
      {
        tab: 'expert' as const,
        category: 'career-business',
        hint: 'يبدو أن احتياجك مهني أو تجاري، لذلك عرضنا خبراء العمل والأعمال.',
        keywords: ['وظيفة', 'مقابلة', 'راتب', 'سيرة', 'مشروع', 'تسويق', 'مبيعات', 'شركة', 'استثمار', 'عمل']
      },
      {
        tab: 'expert' as const,
        category: 'life-coaching',
        hint: 'يبدو أنك تحتاج توجيهاً حياتياً أو قراراً شخصياً، لذلك عرضنا المختصين الأقرب.',
        keywords: ['قرار', 'حياة', 'عادة', 'تحفيز', 'وقت', 'ثقة', 'تواصل', 'هدف', 'تطوير']
      }
    ];

    const bestMatch = matchGroups
      .map(group => ({
        ...group,
        score: group.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? 1 : 0), 0)
      }))
      .sort((a, b) => b.score - a.score)[0];

    const inferredTab = bestMatch && bestMatch.score > 0 ? bestMatch.tab : currentMarketplaceTab;
    const inferredCategory = bestMatch && bestMatch.score > 0 ? bestMatch.category : '';

    setCurrentMarketplaceTab(inferredTab);
    setSelectedCategory(inferredCategory);
    setSelectedSpecialty('');
    setSearchQuery(text);
    setOnlineOnly(true);
    setSmartMatchMode(true);
    setLoadingProviders(true);
    setCurrentView('marketplace');

    try {
      const result = await api.matchProviders({
        prompt: text,
        providerType: inferredTab,
        category: inferredCategory,
        onlineOnly: true,
        language: selectedLanguage || undefined
      });

      setProviders(result.providers);
      setMatchHint(result.summary || (bestMatch?.hint ?? 'رتبنا النتائج بناءً على وصفك ونبذة مقدمي الخدمة.'));
    } catch (err: any) {
      setMatchHint(err.message || 'تعذر تشغيل المطابقة الذكية الآن، عرضنا نتائج البحث العادي بدلاً من ذلك.');
      setSmartMatchMode(false);
    } finally {
      setLoadingProviders(false);
    }
  };


  // --- Helper metadata mappings ---
  const marketplaceTabs = [
    { id: 'creator', label: 'تواصل مع مشهور', icon: Sparkles },
    { id: 'expert', label: 'تواصل مع خبير', icon: Building }
  ];

  const landingPreviewFilters = [
    { id: 'all', label: 'الكل' },
    { id: 'creator', label: 'مشاهير ومؤثرين' },
    { id: 'legal', label: 'قانون' },
    { id: 'health', label: 'صحة وأدوية' },
    { id: 'tech', label: 'تقنية' },
    { id: 'business-life', label: 'أعمال وحياة' }
  ];

  const landingPreviewCards = [
    {
      name: 'نورة فهد',
      handle: 'noura_live',
      group: 'creator',
      type: 'مشهور / مؤثر',
      reason: 'مكالمة خاصة، تهنئة، أو سؤال سريع من المتابعين.',
      price: 75,
      rating: 4.9,
      calls: 218,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop',
      accent: 'amber'
    },
    {
      name: 'كابتن ماجد',
      handle: 'majed_fit',
      group: 'creator',
      type: 'رياضي / صانع محتوى',
      reason: 'نصيحة تدريب، رسالة تحفيز، أو لقاء سريع مع الجمهور.',
      price: 60,
      rating: 4.8,
      calls: 143,
      image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=220&h=220&fit=crop',
      accent: 'amber'
    },
    {
      name: 'المحامي سامي',
      handle: 'sami_legal',
      group: 'legal',
      type: 'قانون وطوارئ',
      reason: 'موقف مفاجئ وتحتاج تعرف خطوتك القانونية التالية.',
      price: 120,
      rating: 5,
      calls: 89,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=220&h=220&fit=crop',
      accent: 'teal'
    },
    {
      name: 'أمل المستشارة',
      handle: 'amal_family',
      group: 'legal',
      type: 'أسرة وعقود',
      reason: 'استشارة أولية حول عقد، خلاف أسري، أو حقوق موظف.',
      price: 95,
      rating: 4.9,
      calls: 64,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=220&h=220&fit=crop',
      accent: 'teal'
    },
    {
      name: 'د. لين الصيدلي',
      handle: 'leen_rx',
      group: 'health',
      type: 'صحة وأدوية',
      reason: 'سؤال عن دواء، أعراض جانبية، أو تداخلات علاجية.',
      price: 55,
      rating: 4.9,
      calls: 172,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=220&h=220&fit=crop',
      accent: 'blue'
    },
    {
      name: 'سارة الدعم النفسي',
      handle: 'sara_calm',
      group: 'health',
      type: 'دعم نفسي فوري',
      reason: 'قلق، ضغط، أو لحظة تحتاج فيها شخصاً يسمعك بهدوء.',
      price: 70,
      rating: 4.8,
      calls: 117,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=220&h=220&fit=crop',
      accent: 'blue'
    },
    {
      name: 'عمر التقنية',
      handle: 'omar_fix',
      group: 'tech',
      type: 'تقنية وحسابات',
      reason: 'حساب مخترق، مشكلة جهاز، أو إعداد تطبيق بسرعة.',
      price: 40,
      rating: 4.7,
      calls: 201,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop',
      accent: 'slate'
    },
    {
      name: 'مهند السيارات',
      handle: 'mohanad_auto',
      group: 'tech',
      type: 'منزل وسيارة',
      reason: 'عطل مفاجئ، لمبة محرك، أو رأي قبل شراء سيارة.',
      price: 45,
      rating: 4.8,
      calls: 96,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop',
      accent: 'slate'
    },
    {
      name: 'ريم الأعمال',
      handle: 'reem_growth',
      group: 'business-life',
      type: 'عمل وأعمال',
      reason: 'مقابلة، تسعير، فكرة مشروع، أو قرار مهني سريع.',
      price: 85,
      rating: 4.9,
      calls: 132,
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=220&h=220&fit=crop',
      accent: 'violet'
    },
    {
      name: 'خالد لايف',
      handle: 'khaled_life',
      group: 'business-life',
      type: 'حياة وعلاقات',
      reason: 'قرار شخصي، تواصل، عادات، أو ترتيب أفكارك الآن.',
      price: 50,
      rating: 4.7,
      calls: 108,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop',
      accent: 'violet'
    }
  ];

  const filteredLandingPreviewCards = landingPreviewFilter === 'all'
    ? landingPreviewCards
    : landingPreviewCards.filter(card => card.group === landingPreviewFilter);

  const handleLandingPreviewCall = () => {
    if (!currentUser) {
      setShowPreviewSigninPrompt(true);
      return;
    }

    if (selectedLandingPreviewCard) {
      setSearchQuery(selectedLandingPreviewCard.name);
      setNeedPrompt(selectedLandingPreviewCard.reason);
      setSelectedCategory('');
      setSelectedSpecialty('');
      setSmartMatchMode(false);
      setMatchHint(null);
    }

    setSelectedLandingPreviewCard(null);
    setShowPreviewSigninPrompt(false);
    setCurrentView('marketplace');
  };

  const getSubsectionsList = () => {
    const selectedSection = sections.find(s => s.slug === selectedCategory);
    return selectedSection?.subsections || [];
  };

  return (
    <div className="min-h-screen soft-grid flex flex-col font-sans" dir="rtl">
      
      {/* GLOBAL HEADERS (Excluded in Calls & Landing layout for focus) */}
      {currentView !== 'call' && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer animate-fade-in" 
              onClick={() => {
                if (!currentUser) setCurrentView('landing');
                else if (currentUser?.role === 'provider') setCurrentView('provider_dashboard');
                else setCurrentView('marketplace');
              }}
            >
              <div className="instant-gradient text-white p-2.5 rounded-2xl shadow-teal-100 shadow-md">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                كونكتو <span className="text-teal-600 font-extrabold text-[10px] align-super">LIVE</span>
              </span>
            </div>

            {/* Nav controls */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {/* Role Specific view tabs */}
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={openAdminDashboard}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 border transition-all ${
                        currentView === 'admin' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      الإدارة
                    </button>
                  )}

                  {currentUser.role === 'provider' && currentUser.approved && (
                    <button 
                      onClick={() => setCurrentView('provider_dashboard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 border transition-all ${
                        currentView === 'provider_dashboard' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      أنا متاح
                    </button>
                  )}

                  <button 
                    onClick={() => setCurrentView('marketplace')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 border transition-all ${
                      currentView === 'marketplace' 
                        ? 'bg-teal-50 border-teal-200 text-teal-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    ابحث الآن
                  </button>

                  <button 
                    onClick={() => setCurrentView('settings')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 border transition-all ${
                      currentView === 'settings' 
                        ? 'bg-teal-50 border-teal-200 text-teal-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    ملفي
                  </button>

                  {/* Profile capsule */}
                  <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3 font-medium">
                    <span className="text-xs text-slate-600">{currentUser.fullName}</span>
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.fullName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4 cursor-pointer" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSignupRolePreset(false); setAuthMode('login'); setCurrentView('auth'); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                  <button 
                    onClick={() => { setSignupRolePreset(false); setAuthMode('signup'); setCurrentView('auth'); }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-100 cursor-pointer"
                  >
                    ابدأ الآن
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>
      )}

      {/* DETECT INCOMING CALL POPUP FOR ACTIVE PROVIDERS */}
      {incomingCallRequest && (
        <div id="incoming-call-alert" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100/90 space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" 
                className="relative rounded-full w-24 h-24 object-cover border-4 border-white shadow-md mx-auto"
                referrerPolicy="no-referrer"
                alt="Client caller"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                طلب مباشر الآن
              </span>
              <h3 className="font-extrabold text-xl text-slate-800 pt-2">{incomingCallRequest.clientName}</h3>
              <p className="text-xs text-slate-400 font-medium">شخص يحتاجك الآن. اقبل المكالمة أو اعتذر بسرعة.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                id="decline-incoming-btn"
                onClick={handleDeclineCall}
                className="flex-1 py-3 bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <PhoneOff className="w-4 h-4" />
                اعتذار
              </button>
              <button 
                id="accept-incoming-btn"
                onClick={handleAcceptCall}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-100"
              >
                <Phone className="w-4 h-4" />
                قبول الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLandingPreviewCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 md:p-6 space-y-5 text-right">
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLandingPreviewCard(null);
                    setShowPreviewSigninPrompt(false);
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right space-y-1">
                    <span className="inline-flex text-[10px] font-black px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                      {selectedLandingPreviewCard.type}
                    </span>
                    <h3 className="text-2xl font-black text-slate-950">{selectedLandingPreviewCard.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono" dir="ltr">@{selectedLandingPreviewCard.handle}</p>
                  </div>
                  <div className="relative shrink-0">
                    <img
                      src={selectedLandingPreviewCard.image}
                      alt={selectedLandingPreviewCard.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-3xl object-cover border border-slate-200 bg-slate-50"
                    />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-bold">التقييم</p>
                  <p className="text-sm font-black text-slate-900 inline-flex items-center justify-center gap-1">
                    {selectedLandingPreviewCard.rating}
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-bold">المكالمات</p>
                  <p className="text-sm font-black text-slate-900">{selectedLandingPreviewCard.calls}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-bold">السعر</p>
                  <p className="text-sm font-black text-slate-900">{selectedLandingPreviewCard.price} ر.س/د</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900">متى يكون مناسباً؟</h4>
                <p className="text-sm text-slate-600 font-semibold leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  {selectedLandingPreviewCard.reason}
                </p>
              </div>

              {showPreviewSigninPrompt && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-black">سجّل دخولك أولاً لطلب المكالمة</p>
                  <p className="text-xs font-semibold leading-relaxed">
                    نحتاج حسابك حتى نحجز المكالمة، نحفظ سجلها، ونربطك بمقدم الخدمة بشكل آمن.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLandingPreviewCard(null);
                        setShowPreviewSigninPrompt(false);
                        setSignupRolePreset(false);
                        setAuthMode('login');
                        setCurrentView('auth');
                      }}
                      className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black"
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLandingPreviewCard(null);
                        setShowPreviewSigninPrompt(false);
                        navigateToSignup('client');
                      }}
                      className="flex-1 py-2.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-black"
                    >
                      إنشاء حساب
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleLandingPreviewCall}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black transition-all shadow-sm shadow-teal-100 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                طلب مكالمة
              </button>
            </div>
          </div>
        </div>
      )}

      {showCallSigninPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 text-right space-y-5">
            <div className="flex items-start justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowCallSigninPrompt(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <div className="bg-teal-50 text-teal-700 w-12 h-12 rounded-2xl flex items-center justify-center mr-auto">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950">سجّل دخولك لطلب المكالمة</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  نحتاج حسابك حتى نحجز المكالمة، نحفظ سجلها، ونربطك بمقدم الخدمة بشكل آمن.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCallSigninPrompt(false);
                  setSignupRolePreset(false);
                  setAuthMode('login');
                  setCurrentView('auth');
                }}
                className="py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all"
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCallSigninPrompt(false);
                  navigateToSignup('client');
                }}
                className="py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black transition-all"
              >
                إنشاء حساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-1 flex flex-col">

        {/* 1. PUBLIC LANDING PAGE */}
        {currentView === 'landing' && (
          <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 max-w-6xl mx-auto space-y-10">
            
            {/* Hero text */}
            <div className="relative text-center space-y-5 max-w-4xl">
              <div className="pointer-events-none hidden md:flex absolute -right-20 top-16 w-16 h-16 rounded-full border-4 border-blue-600 text-blue-600 items-center justify-center rotate-12">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div className="pointer-events-none hidden md:flex absolute -left-20 top-28 w-14 h-14 rounded-full border-4 border-teal-600 text-teal-600 items-center justify-center -rotate-12">
                <PhoneCall className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2 rounded-full inline-flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                مشاهير وخبراء، جاهزون لمكالمة مباشرة
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.2]">
                كلّم مشهور يلهمك أو خبير يساعدك. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">مكالمة واحدة تكفي.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 font-semibold leading-relaxed max-w-2xl mx-auto">
                تواصل فوراً مع شخصية تحبها، أو خبير يفهم موقفك. وإذا لديك جمهور أو خبرة، افتح مكتبك واستقبل مكالمات مدفوعة في أي وقت.
              </p>
            </div>

            {/* Primary intent choice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
              
              {/* Caller lane */}
              <div id="caller-lane-card" className="bento-card p-7 flex flex-col justify-between space-y-6 border-teal-100 bg-white/95">
                <div className="space-y-4 text-right">
                  <div className="bg-teal-100 p-4 rounded-2xl text-teal-700 w-12 h-12 flex items-center justify-center">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">أريد إجراء مكالمة</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    ابحث عن مشهور أو خبير متاح الآن، اختر الشخص المناسب، وابدأ مكالمة صوتية مباشرة بدون موعد.
                  </p>
                </div>
                <button 
                  onClick={() => navigateToSignup('client')}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-100 cursor-pointer"
                >
                  ابدأ البحث الآن
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Receiver lane */}
              <div id="receiver-lane-card" className="bento-card p-7 flex flex-col justify-between space-y-6 border-amber-100 bg-white/95">
                <div className="space-y-4 text-right">
                  <div className="bg-amber-100 p-4 rounded-2xl text-amber-700 w-12 h-12 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">أريد استقبال المكالمات</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    للمشاهير والخبراء: أنشئ ملفك، حدد سعرك، وافتح حالتك ليستطيع الناس الاتصال بك مباشرة.
                  </p>
                </div>
                {showProviderSignupOptions ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigateToProviderSignup('creator')}
                      className="py-3 px-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      مشهور / مؤثر
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToProviderSignup('expert')}
                      className="py-3 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-100 cursor-pointer"
                    >
                      خبير / مستشار
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowProviderSignupOptions(true)}
                    className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    ابدأ استقبال المكالمات
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>

            </div>

            {/* Marketplace preview cards */}
            <section className="w-full max-w-6xl space-y-5 text-right" dir="rtl">
              <div className="space-y-2 text-right">
                <div className="space-y-1 max-w-3xl mr-0 ml-auto">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-950">مشاهير وخبراء جاهزون للمكالمة</h2>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    جرّب الفلاتر وشاهد كيف سيظهر مقدمو الخدمة: كل بطاقة تعرض التخصص، السعر، التقييم، وحالة التوفر.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-start gap-2" dir="rtl">
                {landingPreviewFilters.map(filter => {
                  const active = landingPreviewFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setLandingPreviewFilter(filter.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all ${
                        active
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {filteredLandingPreviewCards.map(card => (
                  <article
                    key={card.handle}
                    onClick={() => {
                      setSelectedLandingPreviewCard(card);
                      setShowPreviewSigninPrompt(false);
                    }}
                    className="bento-card p-4 bg-white/95 border-slate-200 text-right flex flex-col gap-4 min-h-[290px] cursor-pointer hover:border-teal-200 hover:-translate-y-1 transition-all"
                    dir="rtl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        card.accent === 'amber' ? 'bg-amber-50 text-amber-700' :
                        card.accent === 'teal' ? 'bg-teal-50 text-teal-700' :
                        card.accent === 'blue' ? 'bg-blue-50 text-blue-700' :
                        card.accent === 'violet' ? 'bg-violet-50 text-violet-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {card.type}
                      </span>
                      <div className="relative shrink-0">
                        <img
                          src={card.image}
                          alt={card.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50"
                        />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-950">{card.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono" dir="ltr">@{card.handle}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold min-h-12">
                      {card.reason}
                    </p>

                    <div className="flex flex-row-reverse items-center justify-between gap-2 text-[11px] text-slate-500 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {card.rating}
                      </span>
                      <span>{card.calls} مكالمة</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold">السعر</p>
                        <p className="text-lg font-black text-slate-950">
                          {card.price}
                          <span className="text-[10px] text-slate-500 font-bold"> ر.س/د</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        متاح الآن
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full py-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-100 rounded-xl text-[11px] font-black transition-all"
                    >
                      عرض التفاصيل
                    </button>
                  </article>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigateToSignup('client')}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black transition-all shadow-sm shadow-teal-100 cursor-pointer"
                >
                  ابدأ واتصل بأحدهم
                </button>
              </div>
            </section>

          </div>
        )}

        {/* 2. AUTHENTICATION PAGES (Login / Signup Choice) */}
        {currentView === 'auth' && (
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full space-y-6">
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {authMode === 'login' ? 'ادخل إلى كونكتو' : 'أنشئ حسابك على كونكتو'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {authMode === 'login' 
                    ? 'تابع مكالماتك، مكتبك، أو الأشخاص المتاحين لك الآن.' 
                    : signupRolePreset
                      ? signupRole === 'provider'
                        ? settingsProviderType === 'creator'
                          ? 'جهز صفحتك كمشهور أو مؤثر، وحدد سعرك لاستقبال مكالمات من جمهورك.'
                          : 'جهز مكتبك كخبير، وحدد مجالك وسعرك لاستقبال مكالمات استشارية.'
                        : 'أنشئ حسابك لتتواصل فوراً مع مشهور يلهمك أو خبير يساعدك.'
                      : 'اختر طريقك: إجراء مكالمة الآن، أو استقبال مكالمات من جمهورك أو عملائك.'}
                </p>
              </div>

              {/* Login / Signup Selector toggles */}
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {/* Role Selection toggles only for new signup */}
              {authMode === 'signup' && !signupRolePreset && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-500">كيف ستستخدم كونكتو؟</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setSignupRole('client')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        signupRole === 'client' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      أريد الاتصال
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSignupRole('provider')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        signupRole === 'provider' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      أستقبل مكالمات
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                
                {authMode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">الاسم الكامل</label>
                      <input 
                        type="text" 
                        required
                        value={authFullName}
                        onChange={e => setAuthFullName(e.target.value)}
                        placeholder="مثل: أحمد العتيبي"
                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">اسم المستخدم (Username)</label>
                      <input 
                        type="text" 
                        required
                        value={authUsername}
                        onChange={e => setAuthUsername(e.target.value)}
                        placeholder="ahmed_99"
                        className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-right"
                      />
                    </div>

                    {signupRole === 'provider' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">عرّف الناس عليك</label>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          اكتب وصفاً قصيراً يشرح من أنت، ما الذي تقدمه، ولمن تناسب مكالماتك. كلما كان وصفك واضحاً، وصل إليك الشخص الأنسب.
                        </p>
                        <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3 space-y-2">
                          <p className="text-[11px] font-black text-teal-700">كيف تكتب نبذة تساعدك تظهر للشخص المناسب؟</p>
                          <ul className="space-y-1 text-[11px] text-slate-600 font-semibold leading-relaxed list-disc list-inside">
                            {settingsProviderType === 'creator' ? (
                              <>
                                <li>اذكر من أنت: مؤثر، فنان، لاعب، صانع محتوى، أو شخصية عامة.</li>
                                <li>وضح نوع المكالمات: تهنئة، نصيحة، حديث مع الجمهور، مراجعة محتوى، أو تحفيز.</li>
                                <li>اكتب الكلمات التي قد يبحث بها المتابع عنك أو عن مجالك.</li>
                              </>
                            ) : (
                              <>
                                <li>اذكر تخصصك الدقيق وخبرتك، وليس المسمى العام فقط.</li>
                                <li>اكتب الحالات التي تستطيع مساعدتها: حادث، عقد، دواء، قلق، حساب مخترق، سيارة، مقابلة.</li>
                                <li>وضح حدود المكالمة: توجيه أولي، خطوة تالية، مراجعة سريعة، أو رأي مهني.</li>
                              </>
                            )}
                          </ul>
                        </div>
                        <textarea
                          required
                          value={authBio}
                          onChange={e => setAuthBio(e.target.value)}
                          rows={4}
                          placeholder={
                            settingsProviderType === 'creator'
                              ? 'مثال: صانع محتوى رياضي، أستقبل مكالمات تهنئة وأسئلة عن التدريب وبناء الجمهور.'
                              : 'مثال: محامي متخصص في حوادث المرور وعقود العمل، أساعد المستخدم يفهم موقفه والخطوة التالية.'
                          }
                          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-right resize-none"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">كلمة المرور</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-100 disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                >
                  {authLoading ? 'جاري التحقق...' : authMode === 'login' ? 'تأكيد تسجيل الدخول' : 'إنشاء الحساب'}
                </button>

              </form>

            </div>
          </div>
        )}

        {/* 3. PENDING APPROVAL VIEW */}
        {currentView === 'pending_approval' && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-md mx-auto space-y-6">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" />
              <div className="relative bg-teal-50 p-6 rounded-full text-teal-600">
                <Clock className="w-12 h-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">نراجع حسابك الآن</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                نراجع حسابات مزودي الخدمة قبل ظهورهم في البحث، حتى يعرف المستخدم أن الشخص الذي يتصل به حقيقي ومناسب للقسم.
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-2xl p-4 border border-slate-200 text-xs font-bold text-slate-600 space-y-1.5">
              <p className="animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                سنفتح لك استقبال المكالمات بمجرد الاعتماد...
              </p>
              <p className="text-[10px] text-slate-400 font-medium">سنعيد توجيهك فوراً لأنا متاح بمجرد الاعتماد والترخيص.</p>
            </div>

            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-200 cursor-pointer"
            >
              تسجيل الخروج والعودة لاحقاً
            </button>
          </div>
        )}

        {/* 4. DISCOVERY / MARKETPLACE PAGE */}
        {currentView === 'marketplace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
            
            {/* Title / Description */}
            <div className="text-right space-y-2">
              <h2 className="text-4xl font-black text-slate-950 tracking-tight">من تحتاج الآن؟</h2>
              <p className="text-xs text-slate-400 font-medium">اختر القسم، شاهد المتاحين، وابدأ مكالمة قصيرة بدون موعد.</p>
            </div>

            {/* Custom Big Tabs (Creators vs Experts) */}
            <div className="grid grid-cols-2 gap-2 max-w-xl mx-auto bg-white/70 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {marketplaceTabs.map(tab => {
                const Icon = tab.icon;
                const active = currentMarketplaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSmartMatchMode(false);
                      setMatchHint(null);
                      setCurrentMarketplaceTab(tab.id as 'creator' | 'expert');
                      setSelectedCategory('');
                      setSelectedSpecialty('');
                    }}
                    className={`py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      active 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : ''}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Expert disclaimer warning */}
            {currentMarketplaceTab === 'expert' && <ExpertDisclaimer />}

            {/* Search, Filter box, category filters */}
            <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-6">
              <div className="rounded-2xl bg-white/85 border border-teal-100 p-4 md:p-5 space-y-3 text-right">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-teal-700">مطابقة ذكية حسب احتياجك</p>
                    <h3 className="text-lg font-black text-slate-950">اكتب موقفك، ونقترح لك الشخص الأنسب</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      لا تحتاج تعرف التصنيف. اكتب ما يحدث معك، وسنبحث في التخصصات والبايو الخاص بالمشاهير والخبراء.
                    </p>
                  </div>
                  {matchHint && (
                    <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-2 rounded-xl text-[11px] font-black leading-relaxed">
                      {matchHint}
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <textarea
                    value={needPrompt}
                    onChange={e => setNeedPrompt(e.target.value)}
                    rows={2}
                    placeholder="مثال: صار لي موقف في الشارع وما أعرف حقي القانوني، أو حسابي انسرق، أو أبي أكلم مؤثر عن مشروع..."
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all text-right resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSmartMatch}
                    className="md:w-44 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all cursor-pointer"
                  >
                    طابقني الآن
                  </button>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {[
                    'تعرضت لمشكلة قانونية وأحتاج محامي الآن',
                    'حسابي انسرق وأحتاج شخص فاهم تقنية',
                    'أبي مكالمة قصيرة مع مؤثر أحبه'
                  ].map(example => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setNeedPrompt(example)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Row 1: Search & language */}
              <div className="flex flex-col md:flex-row items-stretch gap-4">
                
                {/* Search query input */}
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => {
                      setSmartMatchMode(false);
                      setMatchHint(null);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder={
                      currentMarketplaceTab === 'creator' 
                        ? 'ابحث عن صانع محتوى، ستريمر، كوميديان...' 
                        : 'ابحث عن محامي، طبيب استشاري، مبرمج، ميكانيكي بحرية...'
                    }
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-right"
                  />
                </div>

                {/* Left controls: Language & Online toggle */}
                <div className="flex items-center gap-3 overflow-x-auto shrink-0 py-1">
                  
                  {/* Language select */}
                  <select
                    value={selectedLanguage}
                    onChange={e => {
                      setSmartMatchMode(false);
                      setSelectedLanguage(e.target.value);
                    }}
                    className="bg-white border border-slate-200 py-3 px-4 rounded-xl text-xs font-bold focus:outline-none text-slate-700 min-w-32"
                  >
                    <option value="">جميع اللغات</option>
                    <option value="العربية">العربية</option>
                    <option value="الإنجليزية">الإنجليزية</option>
                    <option value="الفرنسية">الفرنسية</option>
                  </select>

                  {/* Online Switcher */}
                  <label className="flex items-center gap-2 bg-white border border-slate-200/90 px-4 py-3 rounded-xl select-none cursor-pointer hover:bg-teal-50 transition-colors shrink-0">
                    <input 
                      type="checkbox"
                      checked={onlineOnly}
                      onChange={e => {
                        setSmartMatchMode(false);
                        setOnlineOnly(e.target.checked);
                      }}
                      className="accent-blue-600 rounded-md w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-600">متاح الآن فقط</span>
                  </label>

                </div>

              </div>

              {/* Dynamic Categories selection carousel */}
              <div className="space-y-2 text-right">
                <label className="text-xs font-extrabold text-slate-500">اختر المسار</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => { setSmartMatchMode(false); setMatchHint(null); setSelectedCategory(''); setSelectedSpecialty(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedCategory === '' 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-100' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    الكل
                  </button>
                  {sections
                    .filter(sec => sec.providerType === currentMarketplaceTab)
                    .map(sec => (
                      <button 
                        key={sec.slug}
                        onClick={() => { setSmartMatchMode(false); setMatchHint(null); setSelectedCategory(sec.slug); setSelectedSpecialty(''); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedCategory === sec.slug 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-100' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sec.labelAr}
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Dynamic Specialty tags based on chosen Category */}
              {selectedCategory && getSubsectionsList().length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-right">
                  <label className="text-xs font-bold text-teal-600">خصص الطلب:</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      onClick={() => { setSmartMatchMode(false); setSelectedSpecialty(''); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        selectedSpecialty === '' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700 font-extrabold' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      الكل في هذا القسم
                    </button>
                    {getSubsectionsList().map(sub => (
                      <button 
                        key={sub.slug}
                        onClick={() => { setSmartMatchMode(false); setSelectedSpecialty(sub.slug); }}
                        className={`px-3 py-1 bg-white border rounded-lg text-xs font-semibold transition-all ${
                          selectedSpecialty === sub.slug 
                            ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {sub.labelAr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Providers Results Grid */}
            {loadingProviders ? (
              <div className="text-center py-20 space-y-3">
                <span className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin inline-block" />
                <p className="text-xs font-bold text-slate-400">نبحث عن المتاحين الآن...</p>
              </div>
            ) : providers.length === 0 ? (
              <div id="marketplace-empty-state" className="bento-card p-12 text-center space-y-4 max-w-md mx-auto shadow-inner">
                <div className="bg-slate-50 p-4 rounded-full w-14 h-14 flex items-center justify-center text-slate-400 mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-800">لا أحد مطابق الآن</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    جرّب إزالة فلتر “متاح الآن”، أو اختر قسماً أوسع. السوق يتحرك حسب من فتح حالته.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSpecialty('');
                    setSearchQuery('');
                    setOnlineOnly(false);
                    setSelectedLanguage('');
                    setSmartMatchMode(false);
                    setMatchHint(null);
                  }}
                  className="px-4 py-2 bg-blue-50 text-teal-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  امسح الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {providers.map(prov => (
                  <ProviderCard 
                    key={prov.id}
                    provider={prov}
                    onCallClick={triggerCallToProvider}
                    onProfileClick={handleViewProfile}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* 5. PROVIDER DETAILED PROFILE PAGE */}
        {currentView === 'profile' && activeProfile && (
          <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8 flex-1">
            
            {/* Back to marketplace */}
            <button 
              onClick={() => setCurrentView('marketplace')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع للبحث
            </button>

            {/* Main profile card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6 md:gap-8">
              
              {/* Avatar section */}
              <div className="relative shrink-0">
                <img 
                  src={activeProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-slate-50 shadow-inner"
                  referrerPolicy="no-referrer"
                  alt={activeProfile.fullName}
                />
                <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white ${
                  activeProfile.settings?.availabilityStatus === 'online' ? 'bg-green-500' : activeProfile.settings?.availabilityStatus === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
              </div>

              {/* Details & Actions */}
              <div className="flex-1 space-y-4">
                
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h2 className="text-2xl font-extrabold text-slate-800">{activeProfile.fullName}</h2>
                      {activeProfile.verified && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" title="خبير معتمد وموثق" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono" dir="ltr">@{activeProfile.username}</p>
                  </div>

                  {/* Settle safety drops */}
                  <div className="flex items-center gap-2 justify-center">
                    <button 
                      onClick={() => handleBlockProvider(activeProfile.id)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                    >
                      حظر
                    </button>
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                    >
                      إبلاغ
                    </button>
                  </div>
                </div>

                {/* Main profile Bio description */}
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {activeProfile.bio || 'لم يضف هذا المزود نبذة بعد.'}
                </p>

                {/* Specialties list */}
                {activeProfile.settings?.specialtySlugs && activeProfile.settings.specialtySlugs.length > 0 && (
                  <div className="space-y-1 flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {activeProfile.settings.specialtySlugs.map((slug: string, i: number) => (
                      <span key={slug + i} className="text-xs font-bold px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                        {slug}
                      </span>
                    ))}
                  </div>
                )}

                {/* Profile Stats blocks */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 max-w-md">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold">التقييم</p>
                    <div className="flex items-center justify-center gap-1 mt-1 text-slate-800">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="font-extrabold text-base">{activeProfile.avgRating}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold">السعر</p>
                    <p className="font-extrabold text-base text-emerald-600 mt-1">
                      {activeProfile.settings?.pricePerMinute || 0} <span className="text-[10px] text-slate-500 font-medium">ريال</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold">اللغة</p>
                    <p className="font-bold text-xs mt-1.5 text-slate-600">
                      {activeProfile.settings?.languages?.join(' / ') || 'العربية'}
                    </p>
                  </div>
                </div>

                {/* Instant CALL action buttons */}
                <div className="pt-4 flex items-center justify-center md:justify-start">
                  <button 
                    id="profile-phone-btn"
                    onClick={() => triggerCallToProvider(activeProfile.id)}
                    disabled={activeProfile.settings?.availabilityStatus === 'offline'}
                    className={`px-8 py-3.5 rounded-2xl shadow-md font-bold text-xs flex items-center gap-2.5 transition-all ${
                      activeProfile.settings?.availabilityStatus === 'online'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100 active:scale-95 cursor-pointer'
                        : activeProfile.settings?.availabilityStatus === 'busy'
                        ? 'bg-amber-400 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    {activeProfile.settings?.availabilityStatus === 'online' 
                      ? 'اتصل الآن' 
                      : activeProfile.settings?.availabilityStatus === 'busy' 
                      ? 'مشغول حالياً'
                      : 'غير متاح الآن'}
                  </button>
                </div>

              </div>

            </div>

            {/* Medical / Legal official warning if expert */}
            {activeProfile.settings?.providerType === 'expert' && <ExpertDisclaimer />}

            {/* Reviews Section List */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-slate-800">آخر التجارب ({activeProfileReviews.length})</h3>
              
              {activeProfileReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 font-medium text-xs">
                  لا توجد تقييمات بعد. كن أول من يترك تجربة.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProfileReviews.map(rev => (
                    <div key={rev.id} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={rev.reviewerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                            className="w-8 h-8 rounded-full object-cover" 
                            referrerPolicy="no-referrer"
                            alt="avatar" 
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{rev.reviewerName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>

                        {/* rating stars */}
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-300" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {rev.comment || 'العميل قام بترك تقييم بالنجوم دون ترك أي تعليق إضافي مبرم.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report modal overlay */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 border border-slate-100 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-800">إبلاغ عن مشكلة</h3>
                    <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5 cursor-pointer" /></button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold">ما المشكلة؟</label>
                    <textarea 
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      rows={4}
                      placeholder="اكتب ما حدث باختصار. سنراجعه من لوحة الإدارة."
                      className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={handleReportProvider}
                      className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm cursor-pointer shadow-rose-100"
                    >
                      إرسال البلاغ
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 6. PROVIDER CENTRAL DASHBOARD */}
        {currentView === 'provider_dashboard' && currentUser && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
            
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800/80">
              
              <div className="flex items-center gap-4 text-right">
                <img 
                  src={currentUser.avatar} 
                  className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover" 
                  referrerPolicy="no-referrer"
                  alt={currentUser.fullName} 
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold">{currentUser.fullName}</h2>
                    {currentUser.verified && <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-500/10" />}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">افتح حالتك عندما تكون جاهزاً لاستقبال مكالمات مباشرة.</p>
                </div>
              </div>

              {/* Status Switcher right side */}
              <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700 text-right space-y-1.5 w-full md:w-auto min-w-56">
                <p className="text-[10px] font-extrabold text-slate-300">استقبال المكالمات:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button 
                    onClick={() => handleProviderToggleStatus('online')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      settingsAvailability === 'online' 
                        ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    متصل
                  </button>
                  <button 
                    onClick={() => handleProviderToggleStatus('busy')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      settingsAvailability === 'busy' 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    مشغول
                  </button>
                  <button 
                    onClick={() => handleProviderToggleStatus('offline')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      settingsAvailability === 'offline' 
                        ? 'bg-slate-600 border-slate-600 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    غير متاح
                  </button>
                </div>
              </div>

            </div>

            {/* Provider quick status banner */}
            {settingsAvailability === 'offline' && (
              <div id="availability-warning" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="text-xs font-bold">
                  أنت مسجل كـ "غير متاح" حالياً. لن تظهر في نتائج تصفح العملاء، ولن تتلقى أي رنين للمكالمات الواردة. يرجى تفعيل الحالة إلى "متصل" لاستقبال الاستشارات الطارئة.
                </p>
              </div>
            )}

            {/* Analytics Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-400">سعرك الحالي</p>
                <p className="text-2xl font-extrabold text-teal-600">
                  {settingsPrice} <span className="text-xs font-bold text-slate-400">ريال/دقيقة</span>
                </p>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-400">مسارك</p>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-600 inline-block">
                  {settingsProviderType === 'creator' ? 'مشهور / مؤثر' : 'خبير معتمد'}
                </span>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-400">التوثيق</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${
                  currentUser.verified 
                    ? 'bg-blue-50 border-blue-200 text-teal-600' 
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}>
                  {currentUser.verified ? 'مكتمل وموثق رسمي' : 'قيد التدقيق والطلب'}
                </span>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-400">لغاتك</p>
                <p className="text-[11px] font-bold text-slate-600">{settingsLanguages.join('، ')}</p>
              </div>

            </div>

            {/* Split Desk: Reviews and verifications request */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: Verified Document form */}
              {!currentUser.verified && (
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-slate-800">وثّق خبرتك</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    للقانون والطب والصحة النفسية، نحتاج رخصة أو إثبات مهني قبل منح شارة التوثيق.
                  </p>

                  <form onSubmit={handleVerifyRequest} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">مجالك المهني</label>
                      <input 
                        type="text"
                        required
                        value={verificationProfession}
                        onChange={e => setVerificationProfession(e.target.value)}
                        placeholder="مثل: صيدلي إكلينيكي معتمد / محامي استئناف شرعي"
                        className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">جهة الاعتماد</label>
                      <input 
                        type="text"
                        required
                        value={verificationJurisdiction}
                        onChange={e => setVerificationJurisdiction(e.target.value)}
                        placeholder="مثل: وزارة العدل / الهيئة السعودية للتخصصات"
                        className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">رقم الترخيص</label>
                      <input 
                        type="text"
                        required
                        value={verificationLicense}
                        onChange={e => setVerificationLicense(e.target.value)}
                        placeholder="مثل: LIC-9988-12-SA"
                        className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono"
                      />
                    </div>

                    {verificationSavedMsg && (
                      <div className="p-3 bg-teal-50 border border-indigo-100 text-teal-700 text-xs font-bold rounded-xl">
                        {verificationSavedMsg}
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      إرسال للمراجعة
                    </button>
                  </form>
                </div>
              )}

              {/* Box 2: Recent Reviews */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-800">آخر ما قاله العملاء</h3>
                
                <div className="space-y-3 max-h-[340px] overflow-y-auto">
                  {/* Pull dynamically or write simple mockup reviews */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-800">أنس خليل</span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-extrabold mr-1">5</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      "استشارة سريعة جداً أنقذتني من شراء سيارة بعطل خفي في الميزانية. شكراً جزيلاً لسرعة التجاوب والمهنية العالية!"
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 7. RINGING & CALL INTERACTIVE VOICE PAGE */}
        {currentView === 'call' && activeCall && (
          <div className="flex-1 bg-slate-900 text-white flex flex-col justify-center items-center py-12 px-6">
            <div className="max-w-md w-full text-center space-y-8 flex flex-col items-center">
              
              {/* Call indicator visual bubble */}
              <div className="relative">
                <span className={`absolute inset-0 rounded-full bg-teal-500/10 animate-ping duration-1000 ${
                  activeCall.status === 'ringing' ? 'inline-block' : 'hidden'
                }`} />
                <img 
                  src={activeCall.providerAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                  className="w-28 h-28 rounded-full border-4 border-slate-800 object-cover shadow-2xl relative"
                  referrerPolicy="no-referrer"
                  alt="avatar"
                />
              </div>

              {/* Label Status */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">{activeCall.providerName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    activeCall.status === 'ringing' ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
                  }`} />
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
                    {activeCall.status === 'ringing' ? 'يرن الآن...' : 'أنتما متصلان'}
                  </span>
                </div>
              </div>

              {/* Active Visualizer Bars */}
              {activeCall.status === 'active' && (
                <div className="py-4">
                  <AudioVisualizer isMuted={isMicrophoneMuted} />
                </div>
              )}

              {/* Timer metrics display */}
              <div className="space-y-1">
                {activeCall.status === 'active' ? (
                  <p className="text-4xl font-mono tracking-wider text-green-400 font-extrabold">
                    {formatTimer(callTimer)}
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs font-medium animate-pulse">ننتظر قبوله للمكالمة...</p>
                )}
                <p className="text-[10px] text-slate-500 font-bold">يحسب الوقت بعد قبول المكالمة</p>
              </div>

              {/* Functional Keypads Mute / Hang Up */}
              <div className="flex items-center justify-center gap-6 pt-4 w-full">
                
                {/* Mute button */}
                <button
                  id="mute-call-btn"
                  onClick={() => setIsMicrophoneMuted(!isMicrophoneMuted)}
                  disabled={activeCall.status !== 'active'}
                  className={`p-4 rounded-full border transition-all ${
                    isMicrophoneMuted 
                      ? 'bg-amber-500 border-amber-400 text-white shadow-lg active:scale-90' 
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer active:scale-90'
                  }`}
                  title={isMicrophoneMuted ? 'إلغاء كتم الميكروفون' : 'كتم الميكروفون'}
                >
                  {isMicrophoneMuted ? (
                    <Unlock className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </button>

                {/* Hang up call */}
                <button 
                  id="hangup-call-btn"
                  onClick={handleHangUp}
                  className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-900/30 active:scale-95 cursor-pointer"
                  title="إنهاء المكالمة"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

              </div>

            </div>
          </div>
        )}

        {/* 8. CALL SUMMARY & EVALUATION REPORT CARD */}
        {currentView === 'call_summary' && summaryCall && (
          <div className="flex-1 flex justify-center items-center px-4 py-12">
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full space-y-6 text-center">
              
              <div className="bg-green-50 p-4 rounded-full w-14 h-14 flex items-center justify-center text-green-500 mx-auto border border-green-100">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-800">انتهت المكالمة</h2>
                <p className="text-xs text-slate-400 font-medium">قيّم التجربة وساعد غيرك يختار بسرعة.</p>
              </div>

              {/* Call receipt cards */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-right space-y-3 font-semibold">
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">المزود:</span>
                  <span className="text-slate-800 font-bold">{summaryCall.providerName}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">المدة:</span>
                  <span className="text-slate-800 font-mono font-bold leading-none">{formatTimer(summaryCall.durationSeconds || 0)}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-200/85 pt-2">
                  <span className="text-slate-400 font-medium">التكلفة التقريبية:</span>
                  <span className="text-emerald-600 font-extrabold tracking-tight">
                    {Math.round(((summaryCall.durationSeconds || 0) / 60) * 10) / 10 || 1} ريال تقريباً
                  </span>
                </div>

              </div>

              <div className="text-[10px] text-slate-400 text-center font-bold px-4 leading-relaxed">
                * سيظهر الإيصال النهائي بعد تفعيل الدفع الإلكتروني وربط المحفظة.
              </div>

              {/* Review Prompt strictly for Clients */}
              {currentUser?.role === 'client' ? (
                <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-slate-100 text-right">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600">كيف كانت المكالمة؟</label>
                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1,2,3,4,5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReviewRating(val)}
                          className="text-amber-500 hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Star className={`w-8 h-8 ${val <= reviewRating ? 'fill-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-xs font-bold text-slate-600">تعليق قصير اختياري</label>
                    <textarea 
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="اكتب آرائك ومقترحاتك حول هذا الخبير، لمساعدة المستشارين الآخرين في ابحث الآن..."
                      className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-100 disabled:bg-slate-300"
                  >
                    {submittingReview ? 'جاري إرسال المراجعة...' : 'إرسال والعودة'}
                  </button>

                </form>
              ) : (
                <button 
                  onClick={() => {
                    setSummaryCall(null);
                    setCurrentView('provider_dashboard');
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-100"
                >
                  العودة لأنا متاح
                </button>
              )}

            </div>
          </div>
        )}

        {/* 9. SETTINGS & PROFILE CONFIGURATOR VIEW */}
        {currentView === 'settings' && currentUser && (
          <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8 flex-1">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8 space-y-6">
              
              <div className="text-right space-y-1 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-extrabold text-slate-800">ملفك العام</h2>
                <p className="text-xs text-slate-400 font-medium">هذه المعلومات تظهر للناس قبل أن يتصلوا بك.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Section A: Core profile details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">الاسم الظاهر</label>
                    <input 
                      type="text" 
                      value={settingsFullName}
                      onChange={e => setSettingsFullName(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 font-mono">رابط الصورة</label>
                    <input 
                      type="text" 
                      value={settingsAvatar}
                      onChange={e => setSettingsAvatar(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">عرّف الناس عليك</label>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    هذا هو النص الذي يقرأه المستخدم والبحث الذكي معاً. عرّف بنفسك، وضّح خبرتك أو حضورك، واكتب الحالات أو المواضيع التي تحب استقبال مكالمات عنها.
                  </p>
                  {currentUser.role === 'provider' && (
                    <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3 space-y-2">
                      <p className="text-[11px] font-black text-teal-700">اجعل وصفك قابلاً للاكتشاف</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold leading-relaxed">
                        <div className="bg-white/70 rounded-xl p-2 border border-teal-100">
                          <span className="font-black text-slate-800">ضمّن:</span> تخصصك، الحالات التي تناسبك، كلمات البحث المحتملة، والنتيجة التي تقدمها في المكالمة.
                        </div>
                        <div className="bg-white/70 rounded-xl p-2 border border-teal-100">
                          <span className="font-black text-slate-800">تجنب:</span> عبارات عامة مثل “أساعد الجميع” فقط. كن محدداً حتى لا تصلك مكالمات غير مناسبة.
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        مثال جيد: “محامية متخصصة في حوادث المرور ومشاكل العمل. أساعدك تفهم حقك، ماذا تقول، وما الخطوة التالية قبل التصعيد.”
                      </p>
                    </div>
                  )}
                  <textarea 
                    value={settingsBio}
                    onChange={e => setSettingsBio(e.target.value)}
                    rows={5}
                    placeholder={
                      currentUser.role === 'provider'
                        ? 'مثال: محامية متخصصة في حوادث المرور وعقود العمل، أساعدك تفهم موقفك والخطوة التالية بسرعة.'
                        : 'اكتب نبذة قصيرة عنك.'
                    }
                    className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Section B: Provider Specific configurations */}
                {currentUser.role === 'provider' && (
                  <div className="space-y-6 border-t border-slate-100 pt-6">
                    <h3 className="font-extrabold text-slate-800 text-sm">كيف تريد أن تظهر؟</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">نوع الظهور</label>
                        <select
                          value={settingsProviderType}
                          onChange={e => setSettingsProviderType(e.target.value as 'creator' | 'expert')}
                          className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <option value="creator">مبدع أو شخصية عامة</option>
                          <option value="expert">خبير جاهز للاستشارة</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">سعرك الحالي بالدقيقة</label>
                        <input 
                          type="number" 
                          value={settingsPrice}
                          min={0}
                          max={10000}
                          onChange={e => setSettingsPrice(parseInt(e.target.value))}
                          className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">القسم الرئيسي</label>
                        <select
                          value={settingsCategory}
                          onChange={e => setSettingsCategory(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <option value="creators-celebrities">لقاءات المبدعين</option>
                          <option value="legal">قانون وطوارئ</option>
                          <option value="emotional-support">دعم نفسي فوري</option>
                          <option value="medical-guidance">صحة وأدوية</option>
                          <option value="career-business">عمل وأعمال</option>
                          <option value="tech-support">تقنية وحسابات</option>
                          <option value="home-car">منزل وسيارة</option>
                          <option value="life-coaching">حياة وعلاقات</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">لغاتك المتاحة لك</label>
                        <div className="flex gap-2">
                          {['العربية', 'الإنجليزية', 'الفرنسية'].map(lang => {
                            const isSelected = settingsLanguages.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  if (isSelected) setSettingsLanguages(prev => prev.filter(l => l !== lang));
                                  else setSettingsLanguages(prev => [...prev, lang]);
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  isSelected 
                                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Specialty Checklist */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">اختر نوع المكالمات التي تستقبلها</label>
                      <div className="flex flex-wrap gap-2">
                        {/* Dynamically list matching subsections from our constant file */}
                        {MARKETPLACE_SECTIONS_DATA.find(s => s.slug === settingsCategory)?.subsections?.map(sub => {
                          const active = settingsSpecialties.includes(sub.slug);
                          return (
                            <button
                              key={sub.slug}
                              type="button"
                              onClick={() => toggleSpecialty(sub.slug)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                active 
                                  ? 'bg-teal-50 border-teal-200 text-teal-700' 
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              {sub.labelAr}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {settingsSavedMsg && (
                  <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl">
                    {settingsSavedMsg}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    حفظ التغييرات
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* 10. SYSTEM ADMINISTRATION OFFICE */}
        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
            
            <div className="text-right space-y-1 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة كونكتو</h2>
                <p className="text-xs text-slate-400 font-medium">إدارة طلبات الانضمام، توثيق الخبراء، البلاغات، ومؤشرات المنصة.</p>
              </div>
              <button 
                onClick={loadAdminData}
                className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                تحديث
              </button>
            </div>

            {/* Admin sub view tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setAdminActiveTab('approvals')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                  adminActiveTab === 'approvals' ? 'border-indigo-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                طلبات انضمام المشاهير والخبراء ({adminUsers.filter(u => !u.approved).length})
              </button>
              <button 
                onClick={() => setAdminActiveTab('verifications')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                  adminActiveTab === 'verifications' ? 'border-indigo-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                توثيق الخبراء المهني ({adminVerifications.filter(v => v.status === 'pending').length})
              </button>
              <button 
                onClick={() => setAdminActiveTab('reports')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                  adminActiveTab === 'reports' ? 'border-indigo-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                البلاغات المرفوعة ({adminReports.length})
              </button>
              <button 
                onClick={() => setAdminActiveTab('analytics')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                  adminActiveTab === 'analytics' ? 'border-indigo-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                الإحصائيات
              </button>
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-6">
              
              {adminLoading ? (
                <div className="text-center py-12 space-y-2">
                  <span className="w-8 h-8 rounded-full border-2 border-slate-100 border-t-indigo-600 animate-spin inline-block" />
                  <p className="text-xs text-slate-400">جاري مسح قواعد البيانات وتحديث لوحة التحكم الإدارية...</p>
                </div>
              ) : (
                <>
                  {/* Sub Task 1: Membership Approvals */}
                  {adminActiveTab === 'approvals' && (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-slate-800 text-sm">مراجعة حسابات المشاهير والخبراء الجدد</h3>
                        <span className="text-slate-400 text-xs font-medium">كل مشهور أو خبير جديد يبقى مخفياً حتى توافق عليه الإدارة.</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                            <tr>
                              <th className="p-3">صورة العرض</th>
                              <th className="p-3">الاسم / المعرّف</th>
                              <th className="p-3">البريد الإلكتروني</th>
                              <th className="p-3">حالة الظهور</th>
                              <th className="p-3 text-left">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {adminUsers.filter(u => u.role === 'provider').length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">لا توجد حالياً طلبات انضمام معلقة للمشاهير أو الخبراء.</td>
                              </tr>
                            ) : (
                              adminUsers.filter(u => u.role === 'provider').map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="Avatar" />
                                  </td>
                                  <td className="p-3">
                                    <p className="font-bold">{u.fullName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono" dir="ltr">@{u.username}</p>
                                  </td>
                                  <td className="p-3">{u.email}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${u.approved ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {u.approved ? 'ظاهر في السوق' : 'بانتظار الموافقة'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-left space-x-2 space-x-reverse">
                                    {!u.approved && (
                                      <button 
                                        onClick={() => handleAdminApproveUser(u.id)}
                                        className="py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold transition cursor-pointer"
                                      >
                                        اعتماد الحساب
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleAdminRejectUser(u.id)}
                                      className="py-1 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold transition cursor-pointer"
                                    >
                                      رفض الطلب
                                    </button>
                                    <button 
                                      onClick={() => handleAdminBanToggle(u.id, u.banned)}
                                      className={`py-1 px-3 rounded text-[10px] font-bold transition cursor-pointer ${
                                        u.banned 
                                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                                      }`}
                                    >
                                      {u.banned ? 'فك الحظر' : 'حظر الحساب'}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* Sub Task 2: Verifications Verification */}
                  {adminActiveTab === 'verifications' && (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-slate-800 text-sm">مراجعة تراخيص الخبراء وإثباتاتهم المهنية</h3>
                        <span className="text-slate-400 text-xs font-medium">اعتماد الترخيص يمنح الخبير شارة موثّق ويزيد ثقة المستخدمين.</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                            <tr>
                              <th className="p-3">اسم الخبير</th>
                              <th className="p-3">التخصص المهني</th>
                              <th className="p-3">رقم الرخصة</th>
                              <th className="p-3">جهة الترخيص / البلد</th>
                              <th className="p-3">حالة الطلب</th>
                              <th className="p-3 text-left">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {adminVerifications.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">لا توجد حالياً طلبات توثيق مهني من الخبراء.</td>
                              </tr>
                            ) : (
                              adminVerifications.map(v => (
                                <tr key={v.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-bold">{v.providerName}</td>
                                  <td className="p-3">{v.profession}</td>
                                  <td className="p-3 font-mono text-right">{v.licenseNumber}</td>
                                  <td className="p-3">{v.jurisdiction}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                      v.status === 'approved' ? 'bg-green-50 text-green-600' : v.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      {v.status === 'approved' ? 'موثّق' : v.status === 'rejected' ? 'مرفوض' : 'بانتظار المراجعة'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-left space-x-2 space-x-reverse">
                                    {v.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleAdminApproveVerify(v.id)}
                                          className="py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold transition cursor-pointer"
                                        >
                                          توثيق الخبير
                                        </button>
                                        <button 
                                          onClick={() => handleAdminRejectVerify(v.id)}
                                          className="py-1 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold transition cursor-pointer"
                                        >
                                          رفض الطلب
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* Sub Task 3: Reports List */}
                  {adminActiveTab === 'reports' && (
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-slate-800 text-sm">البلاغات وسرية الشكاوي بين المستخدمين والعملاء</h3>
                        <span className="text-rose-600 text-xs font-bold animate-pulse">يجب الرد ومعالجة شكاوي الحظر للحفاظ على سلامة المجتمع والمنصة.</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                            <tr>
                              <th className="p-3">اسم المبلغ</th>
                              <th className="p-3">المبلغ عليه (الخبير/المبدع)</th>
                              <th className="p-3">أسباب تفصيل البلاغ والتعسّف</th>
                              <th className="p-3">تاريخ الإرسال</th>
                              <th className="p-3 text-left">التدبير المطلوب</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {adminReports.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد أي بلاغات معلقة أو شكاوي إساءة سلوك مرفوعة للمراجعة.</td>
                              </tr>
                            ) : (
                              adminReports.map(rep => (
                                <tr key={rep.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-bold">{rep.reporterName}</td>
                                  <td className="p-3 text-rose-600">{rep.reportedName}</td>
                                  <td className="p-3 max-w-xs">{rep.reason}</td>
                                  <td className="p-3">{new Date(rep.createdAt).toLocaleDateString('ar-SA')}</td>
                                  <td className="p-3 text-left space-x-2 space-x-reverse">
                                    <button 
                                      onClick={() => handleAdminDeleteReport(rep.id)}
                                      className="py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold transition cursor-pointer"
                                    >
                                      حفظ وأرشفة كتم الإبلاغ
                                    </button>
                                    <button 
                                      onClick={() => handleAdminBanToggle(rep.reportedId, false)}
                                      className="py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition cursor-pointer"
                                    >
                                      حظر الفاعل فوراً
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* Sub Task 4: Platform Analytics */}
                  {adminActiveTab === 'analytics' && adminAnalytics && (
                    <div className="space-y-6">
                      
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-800 text-sm">تقرير مؤشرات القياس والتحليلات لكونكتو</h3>
                        <span className="text-slate-400 text-xs font-medium">أداء استخدام الاتصالات عبر نظام المكاملة Agora RTC المباشر.</span>
                      </div>

                      {/* Bento grid analytics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">إجمالي الحسابات بالمنصة</p>
                          <p className="text-3xl font-black text-slate-800">{adminAnalytics.totalUsers}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">إجمالي العملاء المشتركين</p>
                          <p className="text-3xl font-black text-slate-800">{adminAnalytics.totalClients}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">إجمالي الخبراء والمبدعين</p>
                          <p className="text-3xl font-black text-slate-800">{adminAnalytics.totalProviders}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">تسجيلات اليوم الجديدة</p>
                          <p className="text-3xl font-black text-teal-600">{adminAnalytics.newUsersToday}</p>
                        </div>

                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">إجمالي محاولات الاتصال</p>
                          <p className="text-3xl font-black text-slate-800">{adminAnalytics.totalCalls}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">المكالمات الصوتية الناجحة</p>
                          <p className="text-3xl font-black text-emerald-600">{adminAnalytics.completedCalls}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">معدل الاستهلاك اليوم</p>
                          <p className="text-3xl font-black text-teal-600">{adminAnalytics.callsToday}</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400">متوسط غلق الاتصال (ثانية)</p>
                          <p className="text-3xl font-black text-slate-800 font-mono" dir="ltr">{adminAnalytics.avgCallDuration}s</p>
                        </div>

                      </div>

                    </div>
                  )}

                </>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      {currentView !== 'call' && (
        <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs font-semibold text-slate-400/90 max-w-7xl mx-auto w-full px-4 mt-12">
          <p>© {new Date().getFullYear()} كونكتو. مكالمات مباشرة عندما تحتاج شخصاً الآن.</p>
          <p className="text-[10px] text-slate-300 font-bold mt-1">نسخة قيد التجهيز للإطلاق، مدعومة بقاعدة Supabase ومكالمات Agora.</p>
        </footer>
      )}

    </div>
  );
}
