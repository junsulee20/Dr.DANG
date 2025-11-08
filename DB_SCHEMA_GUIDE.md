# Supabase DB 스키마 설정 가이드

## 현재 사용 중인 스키마

권장 스키마 파일: **`server/supabase/migrations/001_initial_schema_simple.sql`**

이 파일은:
- email과 profile_image를 NULL 허용으로 설정 ✅
- nickname도 NULL 허용 ✅
- 트리거와 함수 포함
- RLS 비활성화 (서버 사이드 접근)

## Supabase SQL Editor에서 실행 방법

### 1단계: 기존 테이블 정리 (선택사항)

기존 테이블이 있으면 먼저 정리:

1. Supabase Dashboard > SQL Editor
2. **New Query** 클릭
3. `server/supabase/migrations/000_cleanup.sql` 내용 복사
4. **Run** 클릭

### 2단계: 새 스키마 생성

1. Supabase Dashboard > SQL Editor
2. **New Query** 클릭
3. `server/supabase/migrations/001_initial_schema_simple.sql` 전체 내용 복사
4. **Run** 클릭
5. "Success. No rows returned" 확인

## 파일 위치

```
server/supabase/migrations/
├── 000_cleanup.sql                          # 기존 테이블 삭제
├── 001_initial_schema_simple.sql            # ✅ 권장 스키마
├── 001_initial_schema.sql                   # 초기 버전
├── 001_initial_schema_fixed.sql             # 수정 버전
└── 001_initial_schema_simple_clean.sql      # 클린업 후 버전
```

## 스키마 주요 내용

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
  gender VARCHAR(20),
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  diabetes_type VARCHAR(50),
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
  meal_type VARCHAR(20) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 실행 순서 (처음부터 다시 할 경우)

### 1. 기존 테이블 삭제
```sql
-- 000_cleanup.sql 전체 내용 복사하여 실행
```

### 2. 새 스키마 생성
```sql
-- 001_initial_schema_simple.sql 전체 내용 복사하여 실행
```

### 3. 확인
Supabase Dashboard > Table Editor에서:
- users 테이블 확인
- user_profiles 테이블 확인
- food_records 테이블 확인

## 주의사항

### ⚠️ 데이터 손실
- 기존 테이블을 삭제하면 모든 데이터가 삭제됩니다
- 테스트 데이터만 있다면 문제없음
- 프로덕션 데이터가 있으면 백업 필수

### ✅ 안전한 방법
- 기존 테이블이 없으면 cleanup 없이 바로 schema 실행
- `CREATE TABLE IF NOT EXISTS`로 안전하게 생성

### 🔄 재실행 가능
- `001_initial_schema_simple.sql`은 여러 번 실행 가능
- `DROP TRIGGER IF EXISTS`로 안전하게 처리

## 빠른 실행

### 방법 1: 처음 실행하는 경우
```sql
-- 001_initial_schema_simple.sql만 실행
```

### 방법 2: 기존 테이블이 있는 경우
```sql
-- 1. 000_cleanup.sql 실행
-- 2. 001_initial_schema_simple.sql 실행
```

## 파일 복사 방법

### WSL2에서 파일 내용 보기
```bash
cat /home/sean/next/drdang/Dr.DANG/server/supabase/migrations/001_initial_schema_simple.sql
```

### Windows 파일 탐색기에서 열기
```bash
explorer.exe /home/sean/next/drdang/Dr.DANG/server/supabase/migrations/
```

그리고 파일을 메모장으로 열어서 복사

## 지금 해야 할 것

1. Supabase Dashboard > SQL Editor 접속
2. `001_initial_schema_simple.sql` 내용 복사
3. SQL Editor에 붙여넣기
4. Run 클릭
5. 성공 확인

파일 경로: `/home/sean/next/drdang/Dr.DANG/server/supabase/migrations/001_initial_schema_simple.sql`

