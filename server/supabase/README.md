# Supabase 설정

## 로컬 개발 환경 설정

1. Supabase CLI 설치 (아직 설치하지 않은 경우):
```bash
npm install -g supabase
```

2. Supabase 로컬 프로젝트 초기화:
```bash
supabase init
```

3. Supabase 로컬 서버 시작:
```bash
supabase start
```

4. 마이그레이션 실행:
```bash
supabase db reset
```

## 프로덕션 설정

1. Supabase 프로젝트 생성: https://supabase.com/dashboard

2. 환경 변수 설정:
   - `SUPABASE_URL`: 프로젝트 URL
   - `SUPABASE_ANON_KEY`: 익명 키 (Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY`: 서비스 역할 키 (Settings > API)

3. 마이그레이션 적용:
   - Supabase Dashboard > SQL Editor에서 `migrations/001_initial_schema.sql` 실행
   - 또는 Supabase CLI 사용: `supabase db push`

## Storage 버킷 설정

1. Supabase Dashboard > Storage로 이동
2. `food-images` 버킷 생성
3. Public으로 설정
4. 파일 크기 제한: 10MB
5. 허용된 MIME 타입: image/jpeg, image/png, image/webp

## RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있으며, 사용자는 자신의 데이터만 접근할 수 있습니다.

주의: 서버 사이드에서는 `SUPABASE_SERVICE_ROLE_KEY`를 사용하여 RLS를 우회할 수 있습니다.

