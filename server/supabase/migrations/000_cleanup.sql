-- 기존 구조 정리 스크립트
-- 주의: 이 스크립트는 모든 데이터를 삭제합니다. 프로덕션 환경에서는 사용하지 마세요!

-- Triggers 삭제
DROP TRIGGER IF EXISTS update_food_records_updated_at ON food_records;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Functions 삭제
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Tables 삭제 (CASCADE로 관련 객체도 함께 삭제)
DROP TABLE IF EXISTS food_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Policies 삭제 (RLS가 활성화된 경우)
-- 주의: 테이블이 삭제되면 자동으로 정리되지만, 명시적으로 정리
DROP POLICY IF EXISTS "Service role only - food_records" ON food_records;
DROP POLICY IF EXISTS "Service role only - user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role only - users" ON users;
DROP POLICY IF EXISTS "Users can delete their own records" ON food_records;
DROP POLICY IF EXISTS "Users can update their own records" ON food_records;
DROP POLICY IF EXISTS "Users can insert their own records" ON food_records;
DROP POLICY IF EXISTS "Users can view their own records" ON food_records;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

