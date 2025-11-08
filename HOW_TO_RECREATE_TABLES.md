# 테이블 강제 재생성 가이드

## 문제: 기존 데이터가 남아있음

`CREATE TABLE IF NOT EXISTS`는 테이블이 이미 존재하면 생성하지 않습니다.
따라서 기존 데이터가 남아있는 것입니다.

## 해결: 강제 재생성

### 방법 1: 단일 SQL 파일로 한 번에 실행 (권장)

**파일**: `FORCE_RECREATE_TABLES.sql`

이 파일은:
1. 기존 테이블 완전히 삭제 (DROP TABLE)
2. 새 테이블 생성 (CREATE TABLE)
3. 한 번에 실행 가능

#### Supabase SQL Editor에서 실행:

1. Supabase Dashboard > SQL Editor
2. New Query
3. `FORCE_RECREATE_TABLES.sql` 전체 내용 복사
4. **Run** 클릭
5. "Success" 확인

#### 터미널에서 파일 보기:
```bash
cat /home/sean/next/drdang/Dr.DANG/FORCE_RECREATE_TABLES.sql
```

### 방법 2: 수동으로 테이블 삭제

#### Supabase Table Editor에서:
1. Table Editor > users 테이블 선택
2. 오른쪽 메뉴 > Delete table
3. user_profiles, food_records도 삭제
4. SQL Editor에서 `001_initial_schema_simple.sql` 실행

### 방법 3: 2단계로 실행

#### 1단계: 삭제만 실행
```sql
DROP TABLE IF EXISTS food_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

#### 2단계: 생성 실행
`001_initial_schema_simple.sql` 실행

## 주의사항

⚠️ **모든 데이터가 삭제됩니다**
- 테스트 계정 포함
- 식단 기록 포함
- 프로필 정보 포함

✅ **테스트 환경이므로 문제없음**

## 확인 방법

### 테이블이 비어있는지 확인:
1. Table Editor > users 클릭
2. 데이터가 없으면 성공
3. 데이터가 있으면 삭제가 안 된 것

### 테이블 구조 확인:
1. Table Editor > users 클릭
2. 컬럼 확인:
   - email: VARCHAR(255), NULL 허용
   - nickname: VARCHAR(255), NULL 허용
   - profile_image: TEXT, NULL 허용

## 지금 실행할 것

**Supabase SQL Editor에서 다음 SQL을 실행:**

```sql
-- 강제 삭제 및 재생성 (FORCE_RECREATE_TABLES.sql 내용)
DROP TABLE IF EXISTS food_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 그리고 001_initial_schema_simple.sql 전체 내용 실행
```

또는 `FORCE_RECREATE_TABLES.sql` 파일 전체를 복사하여 실행 (더 간단)

## 실행 후

1. Table Editor에서 users 테이블 확인
2. 데이터가 비어있는지 확인
3. 웹에서 카카오 로그인 테스트
4. 새로운 사용자가 생성되는지 확인

파일 내용을 복사해서 실행하세요!

