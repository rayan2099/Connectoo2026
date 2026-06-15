/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'client' | 'provider' | 'admin';
export type ProviderType = 'creator' | 'expert';
export type AvailabilityStatus = 'online' | 'offline' | 'busy';
export type CallStatus = 'ringing' | 'active' | 'completed' | 'rejected' | 'missed';

export interface Profile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  role: UserRole;
  approved: boolean;
  verified: boolean;
  banned: boolean;
  createdAt: string;
}

export interface ProviderSettings {
  id: string;
  userId: string;
  providerType: ProviderType;
  availabilityStatus: AvailabilityStatus;
  categorySlug: string;
  specialtySlugs: string[];
  languages: string[];
  pricePerMinute: number;
  updatedAt: string;
}

export interface MarketplaceSection {
  id: string;
  slug: string;
  providerType: ProviderType;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  sortOrder: number;
  active: boolean;
  subsections?: MarketplaceSubsection[];
}

export interface MarketplaceSubsection {
  id: string;
  sectionId: string;
  slug: string;
  labelAr: string;
  labelEn: string;
  sortOrder: number;
  active: boolean;
}

export interface Call {
  id: string;
  clientId: string;
  providerId: string;
  clientName?: string;
  providerName?: string;
  providerUsername?: string;
  providerAvatar?: string;
  channelName: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  providerId: string;
  callId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedId: string;
  reportedName?: string;
  reason: string;
  createdAt: string;
}

export interface ProviderVerification {
  id: string;
  providerId: string;
  providerName?: string;
  status: 'pending' | 'approved' | 'rejected';
  profession: string;
  jurisdiction: string;
  licenseNumber: string;
  documentUrl: string;
  notes: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Payment {
  id: string;
  callId: string;
  clientId: string;
  providerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  providerEarnings: number;
  status: string;
  createdAt: string;
}

// Fixed marketplace structure matching requirements
export const MARKETPLACE_SECTIONS_DATA: Omit<MarketplaceSection, 'id'>[] = [
  {
    slug: 'creators-celebrities',
    providerType: 'creator',
    labelAr: 'لقاءات المبدعين',
    labelEn: 'Creator Calls',
    descriptionAr: 'مكالمات صوتية خاصة مع مؤثرين، فنانين، لاعبين، ومشاهير تتابعهم. للتواصل، الأسئلة، التهاني، واللحظات الحصرية.',
    sortOrder: 1,
    active: true,
    subsections: [
      { id: '1-1', sectionId: '1', slug: 'mouather', labelAr: 'مؤثر', labelEn: 'Influencer', sortOrder: 1, active: true },
      { id: '1-2', sectionId: '1', slug: 'mashhour', labelAr: 'مشهور', labelEn: 'Celebrity', sortOrder: 2, active: true },
      { id: '1-3', sectionId: '1', slug: 'mousiqi', labelAr: 'موسيقي', labelEn: 'Musician', sortOrder: 3, active: true },
      { id: '1-4', sectionId: '1', slug: 'riyadi', labelAr: 'رياضي', labelEn: 'Athlete', sortOrder: 4, active: true },
      { id: '1-5', sectionId: '1', slug: 'laeb', labelAr: 'لاعب', labelEn: 'Gamer', sortOrder: 5, active: true },
      { id: '1-6', sectionId: '1', slug: 'komidi', labelAr: 'كوميدي', labelEn: 'Comedian', sortOrder: 6, active: true },
      { id: '1-7', sectionId: '1', slug: 'shakhsiya-aama', labelAr: 'شخصية عامة', labelEn: 'Public Figure', sortOrder: 7, active: true }
    ]
  },
  {
    slug: 'legal',
    providerType: 'expert',
    labelAr: 'قانون وطوارئ',
    labelEn: 'Legal & Urgent Situations',
    descriptionAr: 'عندما يحدث موقف مفاجئ وتحتاج أن تفهم حقوقك وخطوتك التالية بسرعة، تحدث مع محام أو خبير قانوني متاح.',
    sortOrder: 2,
    active: true,
    subsections: [
      { id: '2-1', sectionId: '2', slug: 'police', labelAr: 'موقف جنائي / شرطة', labelEn: 'Criminal Case / Police', sortOrder: 1, active: true },
      { id: '2-2', sectionId: '2', slug: 'traffic-accident', labelAr: 'حادث مروري', labelEn: 'Traffic Accident', sortOrder: 2, active: true },
      { id: '2-3', sectionId: '2', slug: 'personal-injury', labelAr: 'إصابة شخصية', labelEn: 'Personal Injury', sortOrder: 3, active: true },
      { id: '2-4', sectionId: '2', slug: 'family-law', labelAr: 'قانون الأسرة', labelEn: 'Family Law', sortOrder: 4, active: true },
      { id: '2-5', sectionId: '2', slug: 'workplace-labor', labelAr: 'العمل والموظفين', labelEn: 'Labor & Employment', sortOrder: 5, active: true },
      { id: '2-6', sectionId: '2', slug: 'immigration', labelAr: 'الهجرة', labelEn: 'Immigration', sortOrder: 6, active: true },
      { id: '2-7', sectionId: '2', slug: 'landlord-tenant', labelAr: 'المالك والمستأجر', labelEn: 'Landlord & Tenant', sortOrder: 7, active: true },
      { id: '2-8', sectionId: '2', slug: 'business-contracts', labelAr: 'عقود الأعمال', labelEn: 'Business Contracts', sortOrder: 8, active: true },
      { id: '2-9', sectionId: '2', slug: 'consumer-rights', labelAr: 'حقوق المستهلك', labelEn: 'Consumer Rights', sortOrder: 9, active: true },
      { id: '2-10', sectionId: '2', slug: 'debt-collection', labelAr: 'الديون والتحصيل', labelEn: 'Debt & Collection', sortOrder: 10, active: true },
      { id: '2-11', sectionId: '2', slug: 'cyber-harassment', labelAr: 'التشهير / المضايقات الإلكترونية', labelEn: 'Defamation / Cyber Harassment', sortOrder: 11, active: true },
      { id: '2-12', sectionId: '2', slug: 'general-legal', labelAr: 'استشارة قانونية عامة', labelEn: 'General Legal Consultation', sortOrder: 12, active: true }
    ]
  },
  {
    slug: 'emotional-support',
    providerType: 'expert',
    labelAr: 'دعم نفسي فوري',
    labelEn: 'Immediate Emotional Support',
    descriptionAr: 'مساحة صوتية هادئة وقت القلق، الضغط، الخلافات، أو اللحظات الثقيلة. تحدث مع مختص أو داعم مؤهل يساعدك ترتب أفكارك.',
    sortOrder: 3,
    active: true,
    subsections: [
      { id: '3-1', sectionId: '3', slug: 'anxiety-panic', labelAr: 'القلق / نوبة هلع', labelEn: 'Anxiety / Panic Attack', sortOrder: 1, active: true },
      { id: '3-2', sectionId: '3', slug: 'stress-burnout', labelAr: 'الضغط / الاحتراق', labelEn: 'Stress / Burnout', sortOrder: 2, active: true },
      { id: '3-3', sectionId: '3', slug: 'relationship-conflict', labelAr: 'خلاف عاطفي', labelEn: 'Relationship Conflict', sortOrder: 3, active: true },
      { id: '3-4', sectionId: '3', slug: 'post-breakup', labelAr: 'دعم بعد الانفصال', labelEn: 'Post-Breakup Support', sortOrder: 4, active: true },
      { id: '3-5', sectionId: '3', slug: 'family-conflict', labelAr: 'خلاف عائلي', labelEn: 'Family Conflict', sortOrder: 5, active: true },
      { id: '3-6', sectionId: '3', slug: 'grief-loss', labelAr: 'الحزن / الفقد', labelEn: 'Grief / Loss', sortOrder: 6, active: true },
      { id: '3-7', sectionId: '3', slug: 'loneliness', labelAr: 'الوحدة', labelEn: 'Loneliness', sortOrder: 7, active: true },
      { id: '3-8', sectionId: '3', slug: 'anger', labelAr: 'إدارة الغضب', labelEn: 'Anger Management', sortOrder: 8, active: true },
      { id: '3-9', sectionId: '3', slug: 'confidence', labelAr: 'الثقة بالنفس', labelEn: 'Self-Confidence', sortOrder: 9, active: true },
      { id: '3-10', sectionId: '3', slug: 'emergency-emotional', labelAr: 'دعم عاطفي طارئ', labelEn: 'Emergency Emotional Support', sortOrder: 10, active: true },
      { id: '3-11', sectionId: '3', slug: 'general-emotional', labelAr: 'اطمئنان عاطفي عام', labelEn: 'General Emotional Well-being', sortOrder: 11, active: true }
    ]
  },
  {
    slug: 'medical-guidance',
    providerType: 'expert',
    labelAr: 'صحة وأدوية',
    labelEn: 'Health & Medication',
    descriptionAr: 'أسئلة سريعة عن دواء، أعراض، تداخلات، أو هل يحتاج الموضوع زيارة طبيب. إرشاد صحي أولي لا يستبدل الطوارئ.',
    sortOrder: 4,
    active: true,
    subsections: [
      { id: '4-1', sectionId: '4', slug: 'medication-questions', labelAr: 'أسئلة عن الأدوية', labelEn: 'Medication Questions', sortOrder: 1, active: true },
      { id: '4-2', sectionId: '4', slug: 'side-effects', labelAr: 'الأعراض الجانبية', labelEn: 'Side Effects', sortOrder: 2, active: true },
      { id: '4-3', sectionId: '4', slug: 'drug-interactions', labelAr: 'تداخلات الأدوية', labelEn: 'Drug Interactions', sortOrder: 3, active: true },
      { id: '4-4', sectionId: '4', slug: 'child-health', labelAr: 'صحة الأطفال', labelEn: 'Children\'s Health', sortOrder: 4, active: true },
      { id: '4-5', sectionId: '4', slug: 'flu-fever', labelAr: 'زكام / إنفلونزا / حرارة', labelEn: 'Cold / Flu / Fever', sortOrder: 5, active: true },
      { id: '4-6', sectionId: '4', slug: 'skin-problems', labelAr: 'مشكلة جلدية', labelEn: 'Skin Issue', sortOrder: 6, active: true },
      { id: '4-7', sectionId: '4', slug: 'minor-injuries', labelAr: 'إصابة بسيطة', labelEn: 'Minor Injury', sortOrder: 7, active: true },
      { id: '4-8', sectionId: '4', slug: 'nutrition-supplements', labelAr: 'التغذية والمكملات', labelEn: 'Nutrition & Supplements', sortOrder: 8, active: true },
      { id: '4-9', sectionId: '4', slug: 'women-health', labelAr: 'صحة المرأة', labelEn: 'Women\'s Health', sortOrder: 9, active: true },
      { id: '4-10', sectionId: '4', slug: 'men-health', labelAr: 'صحة الرجل', labelEn: 'Men\'s Health', sortOrder: 10, active: true },
      { id: '4-11', sectionId: '4', slug: 'chronic-conditions', labelAr: 'إرشاد للحالات المزمنة', labelEn: 'Chronic Conditions Guidance', sortOrder: 11, active: true },
      { id: '4-12', sectionId: '4', slug: 'need-doctor', labelAr: 'هل أحتاج طبيب؟', labelEn: 'Do I Need a Doctor?', sortOrder: 12, active: true }
    ]
  },
  {
    slug: 'career-business',
    providerType: 'expert',
    labelAr: 'عمل وأعمال',
    labelEn: 'Work & Business',
    descriptionAr: 'قرارات مهنية وتجارية تحتاج جواباً سريعاً: مقابلة، راتب، مشروع، تسويق، أو مشكلة في العمل.',
    sortOrder: 5,
    active: true,
    subsections: [
      { id: '5-1', sectionId: '5', slug: 'interview-prep', labelAr: 'التحضير للمقابلات', labelEn: 'Interview Prep', sortOrder: 1, active: true },
      { id: '5-2', sectionId: '5', slug: 'resume-review', labelAr: 'مراجعة السيرة الذاتية', labelEn: 'Resume Review', sortOrder: 2, active: true },
      { id: '5-3', sectionId: '5', slug: 'salary-negotiation', labelAr: 'التفاوض على الراتب', labelEn: 'Salary Negotiation', sortOrder: 3, active: true },
      { id: '5-4', sectionId: '5', slug: 'career-pivot', labelAr: 'تغيير المسار المهني', labelEn: 'Career Pivot', sortOrder: 4, active: true },
      { id: '5-5', sectionId: '5', slug: 'work-conflict', labelAr: 'خلاف في العمل', labelEn: 'Workplace Conflict', sortOrder: 5, active: true },
      { id: '5-6', sectionId: '5', slug: 'hr-employee-rights', labelAr: 'الموارد البشرية / حقوق الموظف', labelEn: 'HR / Employee Rights', sortOrder: 6, active: true },
      { id: '5-7', sectionId: '5', slug: 'startup-advice', labelAr: 'نصائح للشركات الناشئة', labelEn: 'Startup Advice', sortOrder: 7, active: true },
      { id: '5-8', sectionId: '5', slug: 'sales-marketing', labelAr: 'المبيعات والتسويق', labelEn: 'Sales & Marketing', sortOrder: 8, active: true },
      { id: '5-9', sectionId: '5', slug: 'finance-accounting-basics', labelAr: 'أساسيات المالية والمحاسبة', labelEn: 'Finance & Accounting Basics', sortOrder: 9, active: true },
      { id: '5-10', sectionId: '5', slug: 'taxes-property', labelAr: 'الضرائب ومسك الدفاتر', labelEn: 'Taxes & Bookkeeping', sortOrder: 10, active: true },
      { id: '5-11', sectionId: '5', slug: 'business-strategy', labelAr: 'استراتيجية الأعمال', labelEn: 'Business Strategy', sortOrder: 11, active: true },
      { id: '5-12', sectionId: '5', slug: 'investor-pitch', labelAr: 'العرض على المستثمرين', labelEn: 'Pitching to Investors', sortOrder: 12, active: true }
    ]
  },
  {
    slug: 'tech-support',
    providerType: 'expert',
    labelAr: 'تقنية وحسابات',
    labelEn: 'Tech & Accounts',
    descriptionAr: 'مشكلة جهاز، إنترنت، حساب مخترق، موقع، تطبيق، أو أداة ذكاء اصطناعي. تحدث مع شخص يعرف الحل العملي.',
    sortOrder: 6,
    active: true,
    subsections: [
      { id: '6-1', sectionId: '6', slug: 'device-issue', labelAr: 'مشكلة هاتف / لابتوب', labelEn: 'Phone / Laptop Issue', sortOrder: 1, active: true },
      { id: '6-2', sectionId: '6', slug: 'internet-router', labelAr: 'الإنترنت / الراوتر', labelEn: 'Internet / Router', sortOrder: 2, active: true },
      { id: '6-3', sectionId: '6', slug: 'software-issues', labelAr: 'حل مشاكل البرامج', labelEn: 'Software Troubleshooting', sortOrder: 3, active: true },
      { id: '6-4', sectionId: '6', slug: 'account-recovery', labelAr: 'استرجاع حساب', labelEn: 'Account Recovery', sortOrder: 4, active: true },
      { id: '6-5', sectionId: '6', slug: 'cybersecurity-hacked', labelAr: 'الأمن السيبراني / حساب مخترق', labelEn: 'Cybersecurity / Hacked Account', sortOrder: 5, active: true },
      { id: '6-6', sectionId: '6', slug: 'website-issues', labelAr: 'مشكلة موقع', labelEn: 'Website Issue', sortOrder: 6, active: true },
      { id: '6-7', sectionId: '6', slug: 'coding-help', labelAr: 'مساعدة برمجية', labelEn: 'Coding Help', sortOrder: 7, active: true },
      { id: '6-8', sectionId: '6', slug: 'app-setup', labelAr: 'إعداد تطبيق', labelEn: 'App Setup', sortOrder: 8, active: true },
      { id: '6-9', sectionId: '6', slug: 'cloud-hosting', labelAr: 'السحابة / الاستضافة', labelEn: 'Cloud & Hosting', sortOrder: 9, active: true },
      { id: '6-10', sectionId: '6', slug: 'ai-tools', labelAr: 'دعم أدوات الذكاء الاصطناعي', labelEn: 'AI Tools Support', sortOrder: 10, active: true },
      { id: '6-11', sectionId: '6', slug: 'gaming-stream', labelAr: 'إعداد الألعاب / البث', labelEn: 'Gaming / Streaming Config', sortOrder: 11, active: true },
      { id: '6-12', sectionId: '6', slug: 'backup-recovery', labelAr: 'نسخ احتياطي / استرجاع بيانات', labelEn: 'Backup / Data Recovery', sortOrder: 12, active: true }
    ]
  },
  {
    slug: 'home-car',
    providerType: 'expert',
    labelAr: 'منزل وسيارة',
    labelEn: 'Home & Car',
    descriptionAr: 'قبل ما تتحرك أو تدفع، خذ رأياً سريعاً من فني أو ميكانيكي حول عطل، فحص، صيانة، أو مشكلة مفاجئة.',
    sortOrder: 7,
    active: true,
    subsections: [
      { id: '7-1', sectionId: '7', slug: 'plumbing', labelAr: 'السباكة', labelEn: 'Plumbing', sortOrder: 1, active: true },
      { id: '7-2', sectionId: '7', slug: 'electrical', labelAr: 'الكهرباء', labelEn: 'Electrical', sortOrder: 2, active: true },
      { id: '7-3', sectionId: '7', slug: 'hvac', labelAr: 'التكييف / التدفئة', labelEn: 'HVAC', sortOrder: 3, active: true },
      { id: '7-4', sectionId: '7', slug: 'appliance-repair', labelAr: 'إصلاح الأجهزة', labelEn: 'Appliance Repair', sortOrder: 4, active: true },
      { id: '7-5', sectionId: '7', slug: 'home-inspection', labelAr: 'فحص المنزل', labelEn: 'Home Inspection', sortOrder: 5, active: true },
      { id: '7-6', sectionId: '7', slug: 'cleaning-pests', labelAr: 'تنظيف / عفن / حشرات', labelEn: 'Cleaning / Mold / Pest', sortOrder: 6, active: true },
      { id: '7-7', sectionId: '7', slug: 'general-maintenance', labelAr: 'صيانة عامة', labelEn: 'General Maintenance', sortOrder: 7, active: true },
      { id: '7-8', sectionId: '7', slug: 'car-wont-start', labelAr: 'السيارة لا تعمل', labelEn: 'Car Won\'t Start', sortOrder: 8, active: true },
      { id: '7-9', sectionId: '7', slug: 'car-accident-guidance', labelAr: 'ما بعد حادث السيارة', labelEn: 'Post-Car Accident Guidance', sortOrder: 9, active: true },
      { id: '7-10', sectionId: '7', slug: 'check-engine', labelAr: 'لمبة المحرك', labelEn: 'Check Engine Light', sortOrder: 10, active: true },
      { id: '7-11', sectionId: '7', slug: 'tires-battery', labelAr: 'الإطارات / البطارية', labelEn: 'Tires / Battery', sortOrder: 11, active: true },
      { id: '7-12', sectionId: '7', slug: 'used-car-advice', labelAr: 'نصيحة قبل شراء سيارة مستعملة', labelEn: 'Advice before buying a used car', sortOrder: 12, active: true }
    ]
  },
  {
    slug: 'life-coaching',
    providerType: 'expert',
    labelAr: 'حياة وعلاقات',
    labelEn: 'Life & Relationships',
    descriptionAr: 'قرارات شخصية، علاقات، عادات، تواصل، أو لحظة تحتاج فيها شخصاً يساعدك ترى الصورة أوضح.',
    sortOrder: 8,
    active: true,
    subsections: [
      { id: '8-1', sectionId: '8', slug: 'decision-making', labelAr: 'اتخاذ القرار', labelEn: 'Decision Making', sortOrder: 1, active: true },
      { id: '8-2', sectionId: '8', slug: 'self-confidence-coaching', labelAr: 'الثقة', labelEn: 'Confidence', sortOrder: 2, active: true },
      { id: '8-3', sectionId: '8', slug: 'productivity', labelAr: 'الإنتاجية', labelEn: 'Productivity', sortOrder: 3, active: true },
      { id: '8-4', sectionId: '8', slug: 'time-management', labelAr: 'إدارة الوقت', labelEn: 'Time Management', sortOrder: 4, active: true },
      { id: '8-5', sectionId: '8', slug: 'habit-building', labelAr: 'بناء العادات', labelEn: 'Habit Building', sortOrder: 5, active: true },
      { id: '8-6', sectionId: '8', slug: 'relationship-guidance', labelAr: 'توجيه العلاقات', labelEn: 'Relationship Coaching', sortOrder: 6, active: true },
      { id: '8-7', sectionId: '8', slug: 'dating-advice', labelAr: 'نصائح المواعدة', labelEn: 'Dating Advice', sortOrder: 7, active: true },
      { id: '8-8', sectionId: '8', slug: 'communication-skills', labelAr: 'مهارات التواصل', labelEn: 'Communication Skills', sortOrder: 8, active: true },
      { id: '8-9', sectionId: '8', slug: 'conflict-resolution', labelAr: 'حل الخلافات', labelEn: 'Conflict Resolution', sortOrder: 9, active: true },
      { id: '8-10', sectionId: '8', slug: 'goal-setting', labelAr: 'تحديد الأهداف', labelEn: 'Goal Setting', sortOrder: 10, active: true },
      { id: '8-11', sectionId: '8', slug: 'motivation', labelAr: 'التحفيز', labelEn: 'Motivation', sortOrder: 11, active: true },
      { id: '8-12', sectionId: '8', slug: 'personal-growth', labelAr: 'النمو الشخصي', labelEn: 'Personal Growth', sortOrder: 12, active: true }
    ]
  }
];

export function getSectionBySlug(slug: string) {
  return MARKETPLACE_SECTIONS_DATA.find(s => s.slug === slug);
}

export function getSubsectionBySlug(sectionSlug: string, subSlug: string) {
  const section = getSectionBySlug(sectionSlug);
  return section?.subsections?.find(sub => sub.slug === subSlug);
}
