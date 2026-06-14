-- Connectoo database schema for Supabase Postgres
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- or link to auth.users if using Supabase directly
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
  approved BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Provider Settings Table
CREATE TABLE IF NOT EXISTS provider_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('creator', 'expert')),
  availability_status TEXT NOT NULL DEFAULT 'offline' CHECK (availability_status IN ('online', 'offline', 'busy')),
  category_slug TEXT NOT NULL,
  specialty_slugs TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{"العربية"}',
  price_per_minute INTEGER NOT NULL CHECK (price_per_minute >= 0 AND price_per_minute <= 10000),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Marketplace Sections Table (To make it dynamic if desired)
CREATE TABLE IF NOT EXISTS marketplace_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('creator', 'expert')),
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Marketplace Subsections Table
CREATE TABLE IF NOT EXISTS marketplace_subsections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES marketplace_sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(section_id, slug)
);

-- 5. Calls Table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  channel_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ringing', 'active', 'completed', 'rejected', 'missed')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0Check (duration_seconds >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE UNIQUE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

-- 9. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Provider Verifications Table
CREATE TABLE IF NOT EXISTS provider_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  profession TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  license_number TEXT NOT NULL,
  document_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ,
  provider_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'SAR',
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  provider_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Discovery performance and filtering indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_approved_banned 
  ON profiles(role, approved, banned);

CREATE INDEX IF NOT EXISTS idx_provider_settings_type_availability 
  ON provider_settings(provider_type, availability_status);

CREATE INDEX IF NOT EXISTS idx_provider_settings_category_slug 
  ON provider_settings(category_slug);

CREATE INDEX IF NOT EXISTS idx_calls_status 
  ON calls(status);

CREATE INDEX IF NOT EXISTS idx_reviews_provider_id 
  ON reviews(provider_id);
