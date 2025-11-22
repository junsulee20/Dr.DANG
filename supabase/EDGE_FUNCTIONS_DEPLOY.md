# Supabase Edge Functions 배포 가이드

## 📋 사전 준비사항

1. **Supabase CLI 설치**

   **⚠️ 중요:** `npm install -g supabase`는 지원되지 않습니다!

   **Windows에서 설치 방법:**

   **방법 1: Scoop 사용 (권장)**
   ```bash
   # Scoop이 설치되어 있지 않다면 먼저 설치
   # PowerShell에서 실행:
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   
   # Supabase CLI 설치
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **방법 2: Chocolatey 사용**
   ```bash
   choco install supabase
   ```

   **방법 3: 프로젝트 로컬 설치 (npx 사용)**
   ```bash
   # 프로젝트 루트에서
   npm install supabase --save-dev
   
   # 사용 시
   npx supabase login
   npx supabase functions deploy
   ```

   **방법 4: 직접 바이너리 다운로드**
   - [Supabase CLI Releases](https://github.com/supabase/cli/releases)에서 Windows 바이너리 다운로드
   - PATH에 추가

2. **Supabase 계정 및 프로젝트**
   - [Supabase Dashboard](https://app.supabase.com)에서 프로젝트 생성
   - 프로젝트 URL과 API 키 확인

---

## 🚀 Step 1: Supabase CLI 로그인

**전역 설치한 경우:**
```bash
supabase login
```

**npx로 설치한 경우:**
```bash
npx supabase login
```

브라우저가 열리면 Supabase 계정으로 로그인하세요.

---

## 🔗 Step 2: 프로젝트 연결

```bash
# 프로젝트 루트에서 실행
cd C:\Dr.DANG

# Supabase 프로젝트와 연결
supabase link --project-ref YOUR_PROJECT_REF
# 또는 npx 사용 시:
npx supabase link --project-ref YOUR_PROJECT_REF
```

**참고:** `YOUR_PROJECT_REF`는 Supabase Dashboard의 프로젝트 설정에서 확인할 수 있습니다.
예: `https://zhntmviycucdvupiccoa.supabase.co` → 프로젝트 ref는 `zhntmviycucdvupiccoa`

---

## 🔐 Step 3: 환경 변수 설정

Supabase Dashboard에서 환경 변수를 설정합니다:

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Settings** → **Edge Functions** → **Secrets**
4. 다음 환경 변수 추가:

```
OPENAI_API_KEY=your_openai_api_key
```

**참고:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는 자동으로 제공됩니다.
- **JWT_SECRET은 별도로 설정할 필요 없습니다!** Supabase의 기본 JWT Secret을 자동으로 사용합니다.
  - Supabase Dashboard → Settings → API → JWT Settings에서 확인 가능

---

## 🚀 Step 4: Edge Functions 배포

### 4.1 모든 함수 배포

```bash
cd C:\Dr.DANG
supabase functions deploy
# 또는 npx 사용 시:
npx supabase functions deploy
```

### 4.2 개별 함수 배포

```bash
# 음식 분석 함수
supabase functions deploy food-analyze
# 또는 npx 사용 시:
npx supabase functions deploy food-analyze

# 식단 기록 함수
supabase functions deploy records

# 사용자 프로필 함수
supabase functions deploy user-profile
```

---

## ✅ Step 5: 배포 확인

배포가 완료되면 다음 URL로 접근할 수 있습니다:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/food-analyze
https://YOUR_PROJECT_REF.supabase.co/functions/v1/records
https://YOUR_PROJECT_REF.supabase.co/functions/v1/user-profile
```

### 테스트 예시

```bash
# 헬스체크 (records 함수)
curl -X GET "https://YOUR_PROJECT_REF.supabase.co/functions/v1/records" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY"
```

---

## 📱 Step 6: 앱 설정 업데이트

### 6.1 환경 변수 설정

`.env` 파일에 Supabase 설정 추가:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

또는 `app.config.js`에서 직접 설정:

```javascript
extra: {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'your_supabase_anon_key',
  // ...
}
```

### 6.2 앱 재빌드

환경 변수를 변경한 경우 앱을 재빌드해야 합니다:

```bash
# Expo 개발 서버 재시작
npx expo start --clear
```

---

## 🔄 Step 7: 로컬 개발 (선택사항)

로컬에서 Edge Functions를 테스트하려면:

```bash
# Supabase 로컬 환경 시작
supabase start
# 또는 npx 사용 시:
npx supabase start

# 함수 로컬 서빙
supabase functions serve food-analyze --no-verify-jwt
# 또는 npx 사용 시:
npx supabase functions serve food-analyze --no-verify-jwt
```

로컬 URL: `http://localhost:54321/functions/v1/food-analyze`

---

## 📊 배포 상태 확인

```bash
# 배포된 함수 목록 확인
supabase functions list
# 또는 npx 사용 시:
npx supabase functions list

# 함수 로그 확인
supabase functions logs food-analyze
# 또는 npx 사용 시:
npx supabase functions logs food-analyze
```

---

## 🐛 문제 해결

### 배포 실패 시

1. **로그 확인**
   ```bash
   supabase functions logs food-analyze
   # 또는 npx 사용 시:
   npx supabase functions logs food-analyze
   ```

2. **환경 변수 확인**
   - Supabase Dashboard → Settings → Edge Functions → Secrets
   - 모든 필수 환경 변수가 설정되어 있는지 확인

3. **프로젝트 연결 확인**
   ```bash
   supabase status
   # 또는 npx 사용 시:
   npx supabase status
   ```

### API 호출 실패 시

1. **CORS 에러**
   - Edge Functions의 CORS 헤더 확인
   - `_shared/cors.ts` 파일 확인

2. **인증 에러**
   - JWT 토큰이 올바른지 확인
   - `apikey` 헤더가 포함되어 있는지 확인

3. **환경 변수 누락**
   - Supabase Dashboard에서 환경 변수 재확인
   - 배포 후 환경 변수 변경 시 재배포 필요

---

## 📚 참고 자료

- [Supabase Edge Functions 공식 문서](https://supabase.com/docs/guides/functions)
- [Deno 런타임 문서](https://deno.land/manual)
- [Supabase CLI 문서](https://supabase.com/docs/reference/cli)

---

## ✅ 체크리스트

- [ ] Supabase CLI 설치 및 로그인
- [ ] 프로젝트 연결 (`supabase link`)
- [ ] 환경 변수 설정 (OPENAI_API_KEY, JWT_SECRET)
- [ ] Edge Functions 배포
- [ ] 배포 확인 (URL 테스트)
- [ ] 앱 설정 업데이트 (supabaseUrl, supabaseAnonKey)
- [ ] 앱 재빌드 및 테스트

