# Supabase SQL Editor 실행 가이드

## 기존 테이블 삭제 후 재생성 순서

### 1단계: 기존 테이블 삭제

#### SQL Editor에서 실행할 내용:
```sql
-- 000_cleanup.sql 전체 내용

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

-- Policies 삭제
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
```

#### 실행 방법:
1. Supabase Dashboard > SQL Editor
2. New Query
3. 위 내용 복사하여 붙여넣기
4. **Run** 클릭
5. "Success" 확인

### 2단계: 새 스키마 생성

#### 파일 위치:
`server/supabase/migrations/001_initial_schema_simple.sql`

#### 터미널에서 파일 내용 보기:
```bash
cat /home/sean/next/drdang/Dr.DANG/server/supabase/migrations/001_initial_schema_simple.sql
```

#### SQL Editor에서 실행:
1. Supabase Dashboard > SQL Editor
2. New Query
3. `001_initial_schema_simple.sql` 전체 내용 복사하여 붙여넣기
4. **Run** 클릭
5. "Success. No rows returned" 확인

### 3단계: 테이블 확인

1. Supabase Dashboard > Table Editor
2. 테이블 목록 확인:
   - ✅ users
   - ✅ user_profiles
   - ✅ food_records

## 스키마 주요 내용 (001_initial_schema_simple.sql)

### users 테이블
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),          -- NULL 허용 ✅
  nickname VARCHAR(255),        -- NULL 허용 ✅
  profile_image TEXT,           -- NULL 허용 ✅
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_profiles 테이블
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  diabetes_type VARCHAR(50) CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'prediabetes')),
  target_calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### food_records 테이블
```sql
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
```

## 주의사항

⚠️ **데이터 손실 경고**
- `000_cleanup.sql`을 실행하면 모든 데이터가 삭제됩니다
- 테스트 환경에서만 사용하세요
- 프로덕션 데이터가 있으면 백업 필수

## 에러 발생 시

### "relation does not exist"
→ 이미 삭제되었거나 존재하지 않음 (무시 가능)

### "already exists"
→ cleanup이 제대로 실행되지 않음
→ cleanup을 다시 실행하거나 Supabase Table Editor에서 수동 삭제

### "permission denied"
→ 권한 문제 (Service Role Key 확인)

## 빠른 실행

1. Supabase Dashboard 접속
2. SQL Editor > New Query
3. 아래 순서로 실행:
   - 1단계: `000_cleanup.sql` 실행
   - 2단계: `001_initial_schema_simple.sql` 실행
4. Table Editor에서 확인

다음 메시지에 두 파일의 내용을 제공하겠습니다.

