# 이메일 로그인/회원가입 테스트 체크리스트

## ✅ 배포 확인 사항

### 1. Edge Functions 배포 상태
- [x] `auth-email` Edge Function이 배포됨
- [x] `--no-verify-jwt` 플래그로 배포됨 (로그인/회원가입은 공개 엔드포인트)

### 2. 환경 변수 설정 (Supabase Dashboard)
**Settings → Edge Functions → Secrets**에서 확인:
- [ ] `JWT_SECRET` 설정됨 (⚠️ **필수** - Vault가 아닌 Edge Functions Secrets에 설정)
- [x] `SUPABASE_URL` 자동 제공됨
- [x] `SUPABASE_SERVICE_ROLE_KEY` 자동 제공됨

### 3. CORS 설정
- [x] 모든 응답에 CORS 헤더 포함
- [x] OPTIONS 요청 처리

### 4. 코드 수정 사항
- [x] JSON 파싱 에러 처리 추가
- [x] 환경 변수 검증 추가
- [x] 타입 안정성 개선 (`req: Request`)

## 🧪 테스트 시나리오

### 시나리오 1: 이메일 로그인 (기존 사용자)
1. 앱 실행
2. 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. **예상 결과**: 로그인 성공, 메인 화면으로 이동

### 시나리오 2: 이메일 회원가입 (신규 사용자)
1. 앱 실행
2. "이메일로 회원가입하기" 클릭
3. 이름, 이메일, 비밀번호, 키, 몸무게 입력
4. 회원가입 버튼 클릭
5. **예상 결과**: 회원가입 성공, 자동 로그인, 메인 화면으로 이동

### 시나리오 3: 잘못된 이메일/비밀번호
1. 존재하지 않는 이메일 또는 잘못된 비밀번호 입력
2. **예상 결과**: "이메일 또는 비밀번호가 올바르지 않습니다." 에러 메시지

### 시나리오 4: 중복 이메일 회원가입
1. 이미 존재하는 이메일로 회원가입 시도
2. **예상 결과**: "이미 사용 중인 이메일입니다." 에러 메시지

## 🔍 디버깅 방법

### 브라우저 콘솔 확인
1. 개발자 도구 열기 (F12)
2. Console 탭에서 다음 로그 확인:
   - `🔵 Supabase 설정:` - 환경 변수 확인
   - `🔵 API 호출:` - 요청 URL 확인
   - `✅ 이메일 로그인 성공:` 또는 `❌ 이메일 로그인 에러:`

### Network 탭 확인
1. Network 탭 열기
2. `/auth-email/login` 또는 `/auth-email/signup` 요청 찾기
3. 확인 사항:
   - **Request Headers**: `apikey` 헤더 포함 여부
   - **Response Headers**: `Access-Control-Allow-Origin: *` 포함 여부
   - **Status Code**: 200 (성공), 400 (검증 오류), 401 (인증 오류), 500 (서버 오류)
   - **Response Body**: 에러 메시지 확인

### Supabase Dashboard 로그 확인
1. Supabase Dashboard → Functions → auth-email
2. Logs 탭에서 확인:
   - `🔵 경로 파싱:` - 경로가 올바르게 파싱되는지
   - `🔵 환경 변수 확인:` - 환경 변수 설정 여부
   - `❌ Auth email error:` - 에러 발생 시 상세 로그

## ⚠️ 주의 사항

1. **JWT_SECRET 위치**: 
   - ❌ Vault에 설정하면 안 됨
   - ✅ Edge Functions Secrets에 설정해야 함

2. **환경 변수**:
   - 프론트엔드: `.env` 파일의 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Edge Functions: Supabase Dashboard에서 자동 제공 + `JWT_SECRET`만 수동 설정

3. **CORS 오류 발생 시**:
   - Edge Function이 최신 버전으로 배포되었는지 확인
   - 브라우저 캐시 삭제 후 재시도

## 🚨 예상 오류 및 해결 방법

### 오류 1: `JWT_SECRET이 설정되지 않았습니다.`
**해결**: Supabase Dashboard → Settings → Edge Functions → Secrets에서 `JWT_SECRET` 설정

### 오류 2: `서버 설정 오류가 발생했습니다.`
**해결**: Edge Functions에 자동으로 제공되는 환경 변수 확인 (일반적으로 발생하지 않음)

### 오류 3: CORS 오류
**해결**: Edge Function 재배포 확인, 브라우저 캐시 삭제

### 오류 4: `요청한 리소스를 찾을 수 없습니다.`
**해결**: 경로 파싱 문제 - 로그에서 `action` 값 확인

