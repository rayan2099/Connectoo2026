/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  Profile, 
  ProviderSettings, 
  Call, 
  Review, 
  Notification, 
  Report, 
  ProviderVerification, 
  Payment,
  MARKETPLACE_SECTIONS_DATA
} from '../src/types.js';

const DB_FILE = path.join(process.cwd(), 'db_store.json');

interface DatabaseSchema {
  profiles: Profile[];
  providerSettings: ProviderSettings[];
  calls: Call[];
  reviews: Review[];
  notifications: Notification[];
  reports: Report[];
  verifications: ProviderVerification[];
  payments: Payment[];
  blocks: { id: string; blockerId: string; blockedId: string; createdAt: string }[];
}

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Build Arabic realistic initial seed data
function getInitialDbState(): DatabaseSchema {
  const nowStr = new Date().toISOString();

  // 1. Initial Profiles
  const profiles: Profile[] = [
    // Admins
    {
      id: 'admin_1',
      email: 'admin@connectoo.app',
      username: 'admin_connectoo',
      fullName: 'مدير النظام',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'إدارة منصة كونكتو والتحقق من صحة تراخيص الخبراء واعتماد المبدعين.',
      role: 'admin',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // Clients
    {
      id: 'client_1',
      email: 'helpooclassmate@gmail.com', // user's default email so they are pre-auth/logged-in cleanly or can test easily!
      username: 'user_connectoo',
      fullName: 'أحمد العتيبي',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bio: 'أحب استشارة الخبراء والتحدث للمؤثرين بخصوص التقنية والرياضة.',
      role: 'client',
      approved: true,
      verified: false,
      banned: false,
      createdAt: nowStr,
    },
    // 1. المبدعون والمشاهير (Creators)
    {
      id: 'provider_1',
      email: 'aboflah@connectoo.app',
      username: 'aboflah',
      fullName: 'حسن سليمان (أبو فلة)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      bio: 'صانع محتوى يوتيوب وستريمر ومهتم بالعمل الخيري وبث الألعاب والضحك مع المتابعين!',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    {
      id: 'provider_2',
      email: 'sherine@connectoo.app',
      username: 'sherine',
      fullName: 'شيرين عبد الوهاب',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
      bio: 'فنانة ومطربة مصرية. اتصلوا بي مباشرة لأي حديث فني أو دعم لمواهبكم الغنائية.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    {
      id: 'provider_3',
      email: 'salem@connectoo.app',
      username: 'salem_athlete',
      fullName: 'سالم الدوسري',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'لاعب كرة قدم سعودي. مستعد للرد على أسئلتكم الرياضية وكيفية الوصول للاحتراف الحقيقي.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 2. القانون (Expert 1)
    {
      id: 'provider_4',
      email: 'yasmin@connectoo.app',
      username: 'yasmin_law',
      fullName: 'المحامية ياسمين الشمري',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      bio: 'محامية مرخصة في القوانين المدنية والشرعية وقانون الأسرة وحوادث المرور ومخالفات العمل.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 3. الدعم النفسي (Expert 2)
    {
      id: 'provider_5',
      email: 'amal_psych@connectoo.app',
      username: 'amal_support',
      fullName: 'الأخصائية أمل الرشيد',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bio: 'أخصائية معالجة نفسية عائلية وموجهة للتخلص من التوتر والقلق المباشر وبناء الثقة بالنفس.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 4. الإرشاد الطبي والصيدلي (Expert 3)
    {
      id: 'provider_6',
      email: 'sami_dr@connectoo.app',
      username: 'dr_sami',
      fullName: 'الدكتور سامي الفيصل',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      bio: 'استشاري طب عام وصيدلاني مرخص. تقديم إرشادات طارئة عن تداخل الأدوية والإنفلونزا وصحة الطفل.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 5. المهنة والأعمال (Expert 4)
    {
      id: 'provider_7',
      email: 'mazen_biz@connectoo.app',
      username: 'mazen_business',
      fullName: 'المستشار مازن عبد العزيز',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      bio: 'خبير إعداد مقابلات العمل الشخصية ومراجعة السير الذاتية وتأسيس وصياغة استراتيجيات الشركات الناشئة.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 6. الدعم التقني (Expert 5)
    {
      id: 'provider_8',
      email: 'fahad_tech@connectoo.app',
      username: 'fahad_tech',
      fullName: 'المهندس فهد الحربي',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      bio: 'متخصص أمن سيبراني واسترجاع حسابات السوشيال ميديا وتطوير البرمجيات وحل مشكلات الأجهزة والشبكات.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 7. المنزل والسيارة (Expert 6)
    {
      id: 'provider_9',
      email: 'mechanic_samir@connectoo.app',
      username: 'samir_auto',
      fullName: 'سمير ميكانيك وسيارات',
      avatar: 'https://images.unsplash.com/photo-1542345812-d98b5cd6cf48?w=150',
      bio: 'خبرة ٢٠ سنة في مشاكل الميكانيكا، لمبة المحرك، فحص السيارات المستعملة والبطاريات الطارئة.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    },
    // 8. توجيه الحياة (Expert 7)
    {
      id: 'provider_10',
      email: 'leila_coach@connectoo.app',
      username: 'leila_coaching',
      fullName: 'الكوتش ليلى العوضي',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      bio: 'مدربة حياة متخصصة في إدارة الوقت، اتخاذ القرارات المصيرية، والتخلص من العادات السلبية وتحديد الأهداف.',
      role: 'provider',
      approved: true,
      verified: true,
      banned: false,
      createdAt: nowStr,
    }
  ];

  // 2. Initial Provider Settings matching the details
  const providerSettings: ProviderSettings[] = [
    {
      id: 'settings_1',
      userId: 'provider_1',
      providerType: 'creator',
      availabilityStatus: 'online',
      categorySlug: 'creators-celebrities',
      specialtySlugs: ['laeb', 'mouather'],
      languages: ['العربية', 'الإنجليزية'],
      pricePerMinute: 150,
      updatedAt: nowStr
    },
    {
      id: 'settings_2',
      userId: 'provider_2',
      providerType: 'creator',
      availabilityStatus: 'online',
      categorySlug: 'creators-celebrities',
      specialtySlugs: ['mousiqi', 'mashhour'],
      languages: ['العربية'],
      pricePerMinute: 450,
      updatedAt: nowStr
    },
    {
      id: 'settings_3',
      userId: 'provider_3',
      providerType: 'creator',
      availabilityStatus: 'busy',
      categorySlug: 'creators-celebrities',
      specialtySlugs: ['riyadi', 'shakhsiya-aama'],
      languages: ['العربية'],
      pricePerMinute: 300,
      updatedAt: nowStr
    },
    {
      id: 'settings_4',
      userId: 'provider_4',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'legal',
      specialtySlugs: ['police', 'traffic-accident', 'family-law'],
      languages: ['العربية', 'الإنجليزية'],
      pricePerMinute: 120,
      updatedAt: nowStr
    },
    {
      id: 'settings_5',
      userId: 'provider_5',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'emotional-support',
      specialtySlugs: ['anxiety-panic', 'loneliness', 'confidence', 'emergency-emotional'],
      languages: ['العربية'],
      pricePerMinute: 80,
      updatedAt: nowStr
    },
    {
      id: 'settings_6',
      userId: 'provider_6',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'medical-guidance',
      specialtySlugs: ['medication-questions', 'drug-interactions', 'flu-fever', 'child-health'],
      languages: ['العربية', 'الإنجليزية'],
      pricePerMinute: 110,
      updatedAt: nowStr
    },
    {
      id: 'settings_7',
      userId: 'provider_7',
      providerType: 'expert',
      availabilityStatus: 'busy',
      categorySlug: 'career-business',
      specialtySlugs: ['interview-prep', 'resume-review', 'startup-advice', 'business-strategy'],
      languages: ['العربية', 'الإنجليزية'],
      pricePerMinute: 160,
      updatedAt: nowStr
    },
    {
      id: 'settings_8',
      userId: 'provider_8',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'tech-support',
      specialtySlugs: ['device-issue', 'account-recovery', 'cybersecurity-hacked', 'coding-help'],
      languages: ['العربية', 'الإنجليزية'],
      pricePerMinute: 90,
      updatedAt: nowStr
    },
    {
      id: 'settings_9',
      userId: 'provider_9',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'home-car',
      specialtySlugs: ['car-wont-start', 'check-engine', 'tires-battery', 'used-car-advice'],
      languages: ['العربية'],
      pricePerMinute: 75,
      updatedAt: nowStr
    },
    {
      id: 'settings_10',
      userId: 'provider_10',
      providerType: 'expert',
      availabilityStatus: 'online',
      categorySlug: 'life-coaching',
      specialtySlugs: ['decision-making', 'habit-building', 'time-management', 'goal-setting'],
      languages: ['العربية'],
      pricePerMinute: 85,
      updatedAt: nowStr
    }
  ];

  // 3. Initial calls, reviews, notifications
  const reviews: Review[] = [
    {
      id: 'review_1',
      reviewerId: 'client_1',
      reviewerName: 'أحمد العتيبي',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      providerId: 'provider_4',
      callId: 'call_finished_1',
      rating: 5,
      comment: 'استشارة ممتازة وسريعة بخصوص قانون التأمين المروري، وفرت عليّ عناء الذهاب للمكتب ومكلفة جداً في الخارج! أنصح بالمحامية ياسمين بشدة.',
      createdAt: nowStr,
    },
    {
      id: 'review_2',
      reviewerId: 'client_1',
      reviewerName: 'أحمد العتيبي',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      providerId: 'provider_1',
      callId: 'call_finished_2',
      rating: 5,
      comment: 'أروع مكالمة في حياتي! أبو فلة متواضع جداً وضحكنا كثيراً وتحدثنا عن التبرعات والألعاب القادمة. شكراً كونكتو!',
      createdAt: nowStr,
    }
  ];

  const calls: Call[] = [
    {
      id: 'call_finished_1',
      clientId: 'client_1',
      providerId: 'provider_4',
      clientName: 'أحمد العتيبي',
      providerName: 'المحامية ياسمين الشمري',
      providerUsername: 'yasmin_law',
      providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      channelName: 'yasmin_law_client_1',
      status: 'completed',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      endedAt: new Date(Date.now() - 3500000).toISOString(),
      durationSeconds: 600,
      createdAt: new Date(Date.now() - 3605000).toISOString(),
    },
    {
      id: 'call_finished_2',
      clientId: 'client_1',
      providerId: 'provider_1',
      clientName: 'أحمد العتيبي',
      providerName: 'حسن سليمان (أبو فلة)',
      providerUsername: 'aboflah',
      providerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      channelName: 'aboflah_client_1',
      status: 'completed',
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      endedAt: new Date(Date.now() - 1710000).toISOString(),
      durationSeconds: 900,
      createdAt: new Date(Date.now() - 1805000).toISOString(),
    }
  ];

  const verifications: ProviderVerification[] = [
    {
      id: 'verify_4',
      providerId: 'provider_4',
      providerName: 'المحامية ياسمين الشمري',
      status: 'approved',
      profession: 'محاماة واستشارات قانونية مرخصة',
      jurisdiction: 'المملكة العربية السعودية',
      licenseNumber: 'L-2023-99881',
      documentUrl: 'https://connectoo.app/docs/license_yasmin.pdf',
      notes: 'تمت مراجعة الهوية ومطابقة رقم الترخيص مع وزارة العدل بنجاح.',
      createdAt: nowStr,
      reviewedAt: nowStr
    },
    {
      id: 'verify_5',
      providerId: 'provider_5',
      providerName: 'الأخصائية أمل الرشيد',
      status: 'approved',
      profession: 'أخصائي نفسي وعائلي',
      jurisdiction: 'الكويت',
      licenseNumber: 'PSY-55441',
      documentUrl: 'https://connectoo.app/docs/license_amal.pdf',
      notes: 'تم فحص الشهادة الأكاديمية والترخيص المهني.',
      createdAt: nowStr,
      reviewedAt: nowStr
    },
    {
      id: 'verify_6',
      providerId: 'provider_6',
      providerName: 'الدكتور سامي الفيصل',
      status: 'approved',
      profession: 'استشاري طب وصيدلة',
      jurisdiction: 'الإمارات العربية المتحدة',
      licenseNumber: 'MD-777122',
      documentUrl: 'https://connectoo.app/docs/license_sami.pdf',
      notes: 'مرخص ومسجل بالهيئة الصحية بنجاح.',
      createdAt: nowStr,
      reviewedAt: nowStr
    }
  ];

  return {
    profiles,
    providerSettings,
    calls,
    reviews,
    notifications: [],
    reports: [],
    verifications,
    payments: [
      {
        id: 'pay_1',
        callId: 'call_finished_1',
        clientId: 'client_1',
        providerId: 'provider_4',
        amount: 120, // 10 mins * 12 SAR
        currency: 'SAR',
        platformFee: 24, // 20%
        providerEarnings: 96,
        status: 'paid',
        createdAt: nowStr
      },
      {
        id: 'pay_2',
        callId: 'call_finished_2',
        clientId: 'client_1',
        providerId: 'provider_1',
        amount: 2250, // 15 mins * 150 SAR
        currency: 'SAR',
        platformFee: 450,
        providerEarnings: 1800,
        status: 'paid',
        createdAt: nowStr
      }
    ],
    blocks: []
  };
}

// Memory cache of DB
let dbCache: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (dbCache) return dbCache;

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
    } else {
      dbCache = getInitialDbState();
      saveDb(dbCache);
    }
  } catch (err) {
    console.error('Error reading JSON DB file, using initial memory state', err);
    dbCache = getInitialDbState();
  }

  return dbCache!;
}

export function saveDb(data: DatabaseSchema): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to JSON DB file', err);
  }
}

// Core Operations Helpers
export const dbOperations = {
  getProfiles(): Profile[] {
    return getDb().profiles;
  },

  getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  },

  getProfileByEmail(email: string): Profile | undefined {
    return this.getProfiles().find(p => p.email.toLowerCase() === email.toLowerCase());
  },

  getProfileByUsername(username: string): Profile | undefined {
    return this.getProfiles().find(p => p.username.toLowerCase() === username.toLowerCase());
  },

  createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'approved' | 'verified' | 'banned'>): Profile {
    const db = getDb();
    const newProfile: Profile = {
      ...profile,
      id: 'u_' + generateId(),
      approved: profile.role === 'client' ? true : false, // clients are auto-approved, providers and admins might need review
      verified: false,
      banned: false,
      createdAt: new Date().toISOString()
    };
    db.profiles.push(newProfile);

    // If provider, create default settings
    if (newProfile.role === 'provider') {
      const defaultSettings: ProviderSettings = {
        id: 'settings_' + generateId(),
        userId: newProfile.id,
        providerType: 'creator', // default
        availabilityStatus: 'offline',
        categorySlug: 'creators-celebrities',
        specialtySlugs: [],
        languages: ['العربية'],
        pricePerMinute: 10,
        updatedAt: new Date().toISOString()
      };
      db.providerSettings.push(defaultSettings);
    }

    saveDb(db);
    return newProfile;
  },

  updateProfile(id: string, updates: Partial<Profile>): Profile {
    const db = getDb();
    const index = db.profiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('User not found');
    db.profiles[index] = { ...db.profiles[index], ...updates };
    saveDb(db);
    return db.profiles[index];
  },

  getProviderSettings(userId: string): ProviderSettings | undefined {
    return getDb().providerSettings.find(s => s.userId === userId);
  },

  updateProviderSettings(userId: string, updates: Partial<ProviderSettings>): ProviderSettings {
    const db = getDb();
    let index = db.providerSettings.findIndex(s => s.userId === userId);
    if (index === -1) {
      // Just in case, create it
      const newSettings: ProviderSettings = {
        id: 'settings_' + generateId(),
        userId,
        providerType: updates.providerType || 'creator',
        availabilityStatus: updates.availabilityStatus || 'offline',
        categorySlug: updates.categorySlug || 'creators-celebrities',
        specialtySlugs: updates.specialtySlugs || [],
        languages: updates.languages || ['العربية'],
        pricePerMinute: updates.pricePerMinute !== undefined ? updates.pricePerMinute : 10,
        updatedAt: new Date().toISOString()
      };
      db.providerSettings.push(newSettings);
      saveDb(db);
      return newSettings;
    }

    db.providerSettings[index] = {
      ...db.providerSettings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    return db.providerSettings[index];
  },

  getCalls(): Call[] {
    return getDb().calls;
  },

  getCallById(id: string): Call | undefined {
    return this.getCalls().find(c => c.id === id);
  },

  createCall(clientId: string, providerId: string): Call {
    const db = getDb();
    
    // Safety & validation checks
    const client = this.getProfileById(clientId);
    const provider = this.getProfileById(providerId);
    if (!client) throw new Error('Client not found');
    if (!provider) throw new Error('Provider not found');
    if (clientId === providerId) throw new Error('لا يمكنك الاتصال بنفسك!');
    
    const settings = this.getProviderSettings(providerId);
    if (!settings || settings.availabilityStatus === 'offline') {
      throw new Error('الخبير أو المبدع غير متصل حالياً');
    }

    // Check if client already has an active call
    const activeCall = db.calls.find(c => c.clientId === clientId && (c.status === 'ringing' || c.status === 'active'));
    if (activeCall) {
      throw new Error('لديك مكالمة نشطة أخرى حالياً!');
    }

    const channelName = `channel_${clientId.substring(0,6)}_${providerId.substring(0,6)}_${Date.now()}`;
    const newCall: Call = {
      id: 'call_' + generateId(),
      clientId,
      providerId,
      clientName: client.fullName,
      providerName: provider.fullName,
      providerUsername: provider.username,
      providerAvatar: provider.avatar,
      channelName,
      status: 'ringing',
      createdAt: new Date().toISOString()
    };

    db.calls.push(newCall);

    // Set provider status to busy on ringing/active if desired, or keep as is. Let's keep status online but let caller know
    saveDb(db);
    return newCall;
  },

  updateCallStatus(id: string, status: Call['status'], durationSeconds?: number): Call {
    const db = getDb();
    const index = db.calls.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Call not found');

    const call = db.calls[index];
    call.status = status;

    if (status === 'active') {
      call.startedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'rejected' || status === 'missed') {
      call.endedAt = new Date().toISOString();
      if (durationSeconds !== undefined) {
        call.durationSeconds = durationSeconds;
      } else if (call.startedAt) {
        const diffMs = Date.now() - new Date(call.startedAt).getTime();
        call.durationSeconds = Math.max(1, Math.round(diffMs / 1000));
      }

      // If completed, let's trigger a simulated payment trace
      if (status === 'completed' && call.durationSeconds) {
        const settings = this.getProviderSettings(call.providerId);
        if (settings) {
          const rate = settings.pricePerMinute;
          const mins = Math.ceil((call.durationSeconds || 0) / 60);
          const totalAmount = rate * mins;
          const fee = Math.round(totalAmount * 0.2 * 100) / 100; // 20%
          const earnings = totalAmount - fee;

          const payment: Payment = {
            id: 'pay_' + generateId(),
            callId: call.id,
            clientId: call.clientId,
            providerId: call.providerId,
            amount: totalAmount,
            currency: 'SAR',
            platformFee: fee,
            providerEarnings: earnings,
            status: 'paid',
            createdAt: new Date().toISOString()
          };
          db.payments.push(payment);
        }
      }
    }

    saveDb(db);
    return call;
  },

  getReviews(providerId?: string): Review[] {
    const db = getDb();
    if (providerId) {
      return db.reviews.filter(r => r.providerId === providerId);
    }
    return db.reviews;
  },

  addReview(reviewerId: string, providerId: string, callId: string, rating: number, comment: string): Review {
    const db = getDb();
    const client = this.getProfileById(reviewerId);
    if (!client) throw new Error('Reviewer not found');

    const existing = db.reviews.find(r => r.callId === callId);
    if (existing) throw new Error('لقد قمت بتقييم هذه المكالمة مسبقاً');

    const newReview: Review = {
      id: 'rev_' + generateId(),
      reviewerId,
      reviewerName: client.fullName,
      reviewerAvatar: client.avatar,
      providerId,
      callId,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newReview);
    saveDb(db);
    return newReview;
  },

  getReports(): Report[] {
    const db = getDb();
    // enrich names
    return db.reports.map(r => {
      const reporter = this.getProfileById(r.reporterId);
      const reported = this.getProfileById(r.reportedId);
      return {
        ...r,
        reporterName: reporter ? reporter.fullName : 'مجهول',
        reportedName: reported ? reported.fullName : 'مجهول'
      };
    });
  },

  addReport(reporterId: string, reportedId: string, reason: string): Report {
    const db = getDb();
    const newReport: Report = {
      id: 'rep_' + generateId(),
      reporterId,
      reportedId,
      reason,
      createdAt: new Date().toISOString()
    };
    db.reports.push(newReport);
    saveDb(db);
    return newReport;
  },

  deleteReport(id: string): boolean {
    const db = getDb();
    const index = db.reports.findIndex(r => r.id === id);
    if (index === -1) return false;
    db.reports.splice(index, 1);
    saveDb(db);
    return true;
  },

  blockUser(blockerId: string, blockedId: string): boolean {
    const db = getDb();
    const exists = db.blocks.some(b => b.blockerId === blockerId && b.blockedId === blockedId);
    if (exists) return true;

    db.blocks.push({
      id: 'blk_' + generateId(),
      blockerId,
      blockedId,
      createdAt: new Date().toISOString()
    });
    saveDb(db);
    return true;
  },

  isBlocked(userA: string, userB: string): boolean {
    const db = getDb();
    return db.blocks.some(b => 
      (b.blockerId === userA && b.blockedId === userB) || 
      (b.blockerId === userB && b.blockedId === userA)
    );
  },

  getVerifications(): ProviderVerification[] {
    const db = getDb();
    return db.verifications.map(v => {
      const provider = this.getProfileById(v.providerId);
      return {
        ...v,
        providerName: provider ? provider.fullName : 'غير معروف'
      };
    });
  },

  submitVerification(providerId: string, profession: string, jurisdiction: string, licenseNumber: string, notes: string): ProviderVerification {
    const db = getDb();
    const existingIndex = db.verifications.findIndex(v => v.providerId === providerId && v.status === 'pending');
    if (existingIndex !== -1) {
      throw new Error('لديك طلب تحقيق قيد المراجعة بالفعل.');
    }

    const newVerify: ProviderVerification = {
      id: 'vfy_' + generateId(),
      providerId,
      status: 'pending',
      profession,
      jurisdiction,
      licenseNumber,
      documentUrl: 'https://connectoo.app/docs/uploaded_license.pdf', // Mock uploaded doc url
      notes,
      createdAt: new Date().toISOString()
    };

    db.verifications.push(newVerify);
    saveDb(db);
    return newVerify;
  },

  approveVerification(id: string): ProviderVerification {
    const db = getDb();
    const index = db.verifications.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Verification request not found');

    const v = db.verifications[index];
    v.status = 'approved';
    v.reviewedAt = new Date().toISOString();

    // Mark provider as verified
    const pIndex = db.profiles.findIndex(profile => profile.id === v.providerId);
    if (pIndex !== -1) {
      db.profiles[pIndex].verified = true;
      db.profiles[pIndex].approved = true; // Also auto approved/active
    }

    saveDb(db);
    return v;
  },

  rejectVerification(id: string): ProviderVerification {
    const db = getDb();
    const index = db.verifications.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Verification request not found');

    const v = db.verifications[index];
    v.status = 'rejected';
    v.reviewedAt = new Date().toISOString();

    saveDb(db);
    return v;
  },

  getAnalytics() {
    const db = getDb();
    const profiles = db.profiles;
    const calls = db.calls;

    const totalUsers = profiles.length;
    const totalClients = profiles.filter(p => p.role === 'client').length;
    const totalProviders = profiles.filter(p => p.role === 'provider').length;
    const totalCalls = calls.length;
    const completedCallsList = calls.filter(c => c.status === 'completed');
    const completedCalls = completedCallsList.length;

    const sumDuration = completedCallsList.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const avgCallDuration = completedCalls > 0 ? Math.round(sumDuration / completedCalls) : 0;

    // Today calculations
    const todayStr = new Date().toISOString().substring(0, 10);
    const newUsersToday = profiles.filter(p => p.createdAt.startsWith(todayStr)).length;
    const callsToday = calls.filter(c => c.createdAt.startsWith(todayStr)).length;

    return {
      totalUsers,
      totalClients,
      totalProviders,
      totalCalls,
      completedCalls,
      avgCallDuration, // in seconds
      newUsersToday,
      callsToday
    };
  }
};
