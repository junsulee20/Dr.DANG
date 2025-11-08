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

-- Row Level Security (RLS) 비활성화
-- 서버 사이드에서만 접근하고 SERVICE_ROLE_KEY를 사용하므로 RLS가 필요하지 않습니다.
-- 클라이언트에서 직접 접근하지 않으므로 보안상 문제 없습니다.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_records DISABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
-- DROP IF EXISTS를 사용하여 기존 트리거가 있어도 에러 없이 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_food_records_updated_at ON food_records;
CREATE TRIGGER update_food_records_updated_at
  BEFORE UPDATE ON food_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

