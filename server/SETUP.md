# Dr.DANG 백엔드 설정 가이드

## 1. 환경 변수 설정

`server/.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# JWT
JWT_SECRET=your_very_secret_jwt_key_here_min_32_chars

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3001/auth/kakao/callback
```

## 2. Supabase 설정

### 프로덕션 (Supabase Cloud)

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. SQL Editor에서 아래 SQL 실행:
   - `supabase/migrations/001_initial_schema_fixed.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행
   - 또는 아래 "SQL 실행 방법" 참고
3. Storage에서 `food-images` 버킷 생성:
   - Public 버킷으로 설정
   - 파일 크기 제한: 10MB
   - 허용 MIME 타입: image/jpeg, image/png, image/webp
4. Settings > API에서 URL과 키 복사하여 `.env`에 설정

### 로컬 개발 (선택사항)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 프로젝트 초기화
cd server
supabase init

# 로컬 서버 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

## SQL 실행 방법

Supabase SQL Editor에서 파일 경로를 입력하는 것이 아니라, **SQL 파일의 내용을 복사해서 붙여넣어야** 합니다.

### 처음 설치하는 경우

#### 방법 1: 간단한 버전 (권장)
1. `server/supabase/migrations/001_initial_schema_simple.sql` 파일을 열기
2. 전체 내용 복사 (Ctrl+A, Ctrl+C 또는 Cmd+A, Cmd+C)
3. Supabase Dashboard > SQL Editor로 이동
4. 새 쿼리 작성 클릭
5. 복사한 SQL을 붙여넣기 (Ctrl+V 또는 Cmd+V)
6. "Run" 버튼 클릭하여 실행

#### 방법 2: RLS 활성화 버전
- `001_initial_schema_fixed.sql` 사용 (RLS 활성화, 서비스 역할만 접근 가능)

### 기존 구조를 다시 생성하는 경우

이미 다른 마이그레이션을 실행했다면, 다음 순서로 실행하세요:

1. **먼저 정리 스크립트 실행** (데이터가 모두 삭제됩니다!)
   - `000_cleanup.sql` 파일 내용을 복사하여 실행

2. **그 다음 간단한 버전 실행**
   - `001_initial_schema_simple_clean.sql` 파일 내용을 복사하여 실행
   - 또는 `001_initial_schema_simple.sql` 사용 (트리거는 DROP IF EXISTS 포함)

## 3. 필요한 키 및 설정

### Supabase
- ✅ Supabase 프로젝트 생성 필요
- ✅ Database 마이그레이션 실행 필요
- ✅ Storage 버킷 생성 필요

### OpenAI
- ✅ OpenAI API 키 필요 (GPT-4 Vision 모델 사용)
- 💰 API 사용량에 따라 비용 발생

### Kakao OAuth
- ✅ [Kakao Developers](https://developers.kakao.com/)에서 앱 등록 필요
- ✅ Redirect URI 설정 필요: `http://localhost:3001/auth/kakao/callback`

## 4. 의존성 설치 및 실행

```bash
cd server
npm install
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 5. API 테스트

### Health Check
```bash
curl http://localhost:3001/health
```

### 카카오 로그인 (예시)
```bash
curl -X POST http://localhost:3001/auth/kakao \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your_kakao_access_token"}'
```

## 다음 단계

1. ✅ Supabase 프로젝트 생성 및 마이그레이션 실행
2. ✅ OpenAI API 키 발급
3. ✅ Kakao OAuth 앱 등록
4. ✅ 환경 변수 설정
5. ✅ 서버 실행 및 테스트

