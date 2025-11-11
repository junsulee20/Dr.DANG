-- Dr. DANG 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- ========================================
-- 0. 기존 테이블 삭제 (클린 설치)
-- ========================================
-- CASCADE 옵션이 트리거와 모든 의존성도 함께 삭제합니다
DROP TABLE IF EXISTS meal_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. users 테이블
-- ========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  height INTEGER,  -- cm
  weight INTEGER,  -- kg
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users 테이블 인덱스
CREATE INDEX idx_users_kakao_id ON users(kakao_id);
CREATE INDEX idx_users_email ON users(email);

-- ========================================
-- 2. meal_records 테이블
-- ========================================
CREATE TABLE meal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  food_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- 분석 결과 (GPT API 응답 저장)
  expected_glucose_rise INTEGER,
  nutrition JSONB,  -- { carbs, protein, fat }
  detailed_nutrition JSONB,  -- { calories, fat, sodium, sugar, ratio }
  recommendations TEXT[],
  analysis_result JSONB,  -- 전체 응답 백업
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- meal_records 테이블 인덱스 (DATE_TRUNC 제거하여 IMMUTABLE 에러 방지)
CREATE INDEX idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX idx_meal_records_user_id ON meal_records(user_id);
CREATE INDEX idx_meal_records_date ON meal_records(date);

-- ========================================
-- 3. Row Level Security (RLS) 비활성화
-- ========================================
-- 서버 사이드에서만 접근하고 SERVICE_ROLE_KEY를 사용하므로 RLS가 필요하지 않습니다.
-- 클라이언트에서 직접 Supabase에 접근하지 않고, 백엔드 API를 통해서만 접근합니다.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. Storage Bucket 설정
-- ========================================

-- Storage Bucket은 Supabase Dashboard에서 수동으로 생성하세요:
-- Bucket 이름: food-images
-- Public: false (Signed URL 사용)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage Policy 예시 (Dashboard에서 설정):
-- 1. 사용자는 자신의 폴더에만 업로드 가능
-- CREATE POLICY "Users can upload own images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'food-images' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- 2. 사용자는 자신의 이미지만 조회 가능
-- CREATE POLICY "Users can view own images"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'food-images' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- ========================================
-- 5. 함수 및 트리거
-- ========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블 updated_at 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- meal_records 테이블 updated_at 트리거 (필요시)
-- CREATE TRIGGER update_meal_records_updated_at
--   BEFORE UPDATE ON meal_records
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. 샘플 데이터 (테스트용)
-- ========================================

-- 테스트 사용자 (선택사항)
-- INSERT INTO users (kakao_id, name, email, height, weight)
-- VALUES ('test_kakao_123', '테스트 유저', 'test@drdang.app', 175, 70)
-- ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS '사용자 정보 테이블';
COMMENT ON TABLE meal_records IS '식단 기록 테이블';
COMMENT ON COLUMN meal_records.nutrition IS '기본 영양 정보: { carbs, protein, fat }';
COMMENT ON COLUMN meal_records.detailed_nutrition IS '상세 영양 정보: { calories, fat, sodium, sugar, ratio }';
COMMENT ON COLUMN meal_records.analysis_result IS 'GPT API 응답 전체 백업';


