-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  nickname VARCHAR(255),
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  height DECIMAL(5, 2), -- cm
  weight DECIMAL(5, 2), -- kg
  diabetes_type VARCHAR(50) CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'prediabetes')),
  target_calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Food records table
CREATE TABLE IF NOT EXISTS food_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analyzed_data JSONB NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_kakao_id ON users(kakao_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_food_records_user_id ON food_records(user_id);
CREATE INDEX IF NOT EXISTS idx_food_records_recorded_at ON food_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_food_records_meal_type ON food_records(meal_type);

-- Row Level Security (RLS) Policies
-- 주의: 카카오 로그인을 사용하므로 Supabase Auth를 사용하지 않습니다.
-- 서버 사이드에서는 SERVICE_ROLE_KEY로 RLS를 우회합니다.
-- 클라이언트에서 직접 접근하지 않으므로 RLS는 비활성화하거나 서버 전용으로 설정합니다.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_records ENABLE ROW LEVEL SECURITY;

-- 서버 사이드에서만 접근하므로 모든 정책을 서비스 역할로만 접근 가능하도록 설정
-- 또는 RLS를 비활성화하고 서버에서만 접근하도록 제한

-- 임시로 모든 접근을 차단 (서버는 SERVICE_ROLE_KEY로 우회 가능)
CREATE POLICY "Service role only - users"
  ON users FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role only - user_profiles"
  ON user_profiles FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role only - food_records"
  ON food_records FOR ALL
  USING (false)
  WITH CHECK (false);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_records_updated_at
  BEFORE UPDATE ON food_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

