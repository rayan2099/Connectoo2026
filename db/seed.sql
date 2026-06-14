-- Connectoo Seed Data
-- 1. Insert Admins
INSERT INTO profiles (id, email, password_hash, username, full_name, role, approved, verified, banned)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'admin@connectoo.app',
  '$2b$10$abcdefghijklmnopqrstuvwxyadminhashhere', -- Simulated bcrypt hash
  'admin_connectoo',
  'مدير النظام',
  'admin',
  true,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 2. Insert Marketplace Sections
-- 2.1 Creators
INSERT INTO marketplace_sections (id, slug, provider_type, label_ar, label_en, description_ar, sort_order, active)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'creators-celebrities',
  'creator',
  'المبدعون والمشاهير',
  'Creators & Celebrities',
  'اتصل بمؤثريك وفنانيك ومشاهيرك المفضلين فوراً لإجراء مكالمة حصرية.',
  1,
  true
) ON CONFLICT DO NOTHING;

-- 2.2 Legal
INSERT INTO marketplace_sections (id, slug, provider_type, label_ar, label_en, description_ar, sort_order, active)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'legal',
  'expert',
  'القانون',
  'Legal Services',
  'استشارات قانونية طارئة وموثوقة من محامين وخبراء معتمدين.',
  2,
  true
) ON CONFLICT DO NOTHING;

-- 2.3 Emotional Support
INSERT INTO marketplace_sections (id, slug, provider_type, label_ar, label_en, description_ar, sort_order, active)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  'emotional-support',
  'expert',
  'الدعم النفسي والعاطفي',
  'Emotional Support',
  'تحدث مع متخصصين نفسيين وداعمين عاطفيين لتخطي التوتر والأزمات بلحظتها.',
  3,
  true
) ON CONFLICT DO NOTHING;

-- Seed Subsections for Creators
INSERT INTO marketplace_subsections (section_id, slug, label_ar, label_en, sort_order)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'mouather', 'مؤثر', 'Influencer', 1),
  ('10000000-0000-0000-0000-000000000001', 'mashhour', 'مشهور', 'Celebrity', 2),
  ('10000000-0000-0000-0000-000000000001', 'mousiqi', 'موسيقي', 'Musician', 3),
  ('10000000-0000-0000-0000-000000000001', 'riyadi', 'رياضي', 'Athlete', 4)
ON CONFLICT DO NOTHING;

-- Seed Subsections for Legal
INSERT INTO marketplace_subsections (section_id, slug, label_ar, label_en, sort_order)
VALUES 
  ('10000000-0000-0000-0000-000000000002', 'police', 'موقف جنائي / شرطة', 'Criminal Case / Police', 1),
  ('10000000-0000-0000-0000-000000000002', 'traffic-accident', 'حادث مروري', 'Traffic Accident', 2),
  ('10000000-0000-0000-0000-000000000002', 'personal-injury', 'إصابة شخصية', 'Personal Injury', 3)
ON CONFLICT DO NOTHING;

-- Seed some sample Providers
-- Provider 1: Celebrity (Wael)
INSERT INTO profiles (id, email, password_hash, username, full_name, avatar, bio, role, approved, verified, banned)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'wael@connectoo.app',
  '$2b$10$abcdefghijklmnopqrstuvwxywaelhash',
  'wael_music',
  'وائل كفوري (شخصية افتراضية)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'مغني وفنان لبناني، سعيد بحواري ومكالماتي معكم عبر كونكتو.',
  'provider',
  true,
  true,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO provider_settings (user_id, provider_type, availability_status, category_slug, specialty_slugs, languages, price_per_minute)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'creator',
  'online',
  'creators-celebrities',
  ARRAY['mousiqi', 'mashhour'],
  ARRAY['العربية', 'الفرنسية'],
  500
) ON CONFLICT DO NOTHING;

-- Provider 2: Legal Expert (Yasmin)
INSERT INTO profiles (id, email, password_hash, username, full_name, avatar, bio, role, approved, verified, banned)
VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'yasmin@connectoo.app',
  '$2b$10$abcdefghijklmnopqrstuvwxyyasminhash',
  'yasmin_lawyer',
  'المحامية ياسمين الشمري',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'محامية متخصصة في حوادث المرور وقوانين الأسرة والعمل مع خبرة تفوق ١٠ سنوات.',
  'provider',
  true,
  true,
  false
) ON CONFLICT DO NOTHING;

INSERT INTO provider_settings (user_id, provider_type, availability_status, category_slug, specialty_slugs, languages, price_per_minute)
VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'expert',
  'online',
  'legal',
  ARRAY['police', 'traffic-accident', 'family-law'],
  ARRAY['العربية', 'الإنجليزية'],
  120
) ON CONFLICT DO NOTHING;
