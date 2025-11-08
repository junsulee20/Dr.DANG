# 카카오 로그인 수정 사항

## 문제점
카카오 로그인 시 받을 수 있는 정보가 제한적입니다:
- `nickname`: 기본적으로 받을 수 있음 ✅
- `email`: 사용자가 동의해야 함 (optional) ⚠️
- `profile_image`: 사용자가 동의해야 함 (optional) ⚠️

## 해결 방법

### 1. 데이터베이스 스키마
- `users` 테이블의 `email`과 `profile_image`는 이미 NULL 허용으로 설정되어 있음 ✅
- `nickname`은 필수이지만, 없을 경우 기본값 설정

### 2. 백엔드 미들웨어 수정
- `server/src/middleware/supabaseAuth.ts` 수정
- 사용자 생성 시 optional 필드는 NULL 허용
- `nickname`이 없으면 기본값 설정: `사용자_{userId}`

### 3. 프론트엔드 수정
- `contexts/AuthContext.tsx`에서 optional 필드 처리
- `lib/supabase.ts`에서 카카오 로그인 시 scopes 최소화

## 수정된 코드

### 사용자 생성 로직
```typescript
const kakaoId = user.user_metadata?.provider_id 
  || user.user_metadata?.sub 
  || user.identities?.[0]?.identity_data?.sub
  || `kakao_${user.id}`;

const nickname = user.user_metadata?.nickname 
  || user.user_metadata?.full_name 
  || user.user_metadata?.name
  || `사용자_${user.id.substring(0, 8)}`; // 기본값

const email = user.email || null; // optional
const profileImage = user.user_metadata?.avatar_url 
  || user.user_metadata?.picture 
  || null; // optional
```

## 테스트 방법

### 1. 카카오 로그인 테스트
1. 앱에서 카카오 로그인 버튼 클릭
2. 카카오 로그인 화면에서 정보 동의
3. 로그인 완료 후 사용자 정보 확인

### 2. 정보 없이 로그인 테스트
1. 카카오 개발자 콘솔에서 scopes 최소화
2. 로그인 시 email, profile_image 동의하지 않음
3. 로그인이 정상적으로 완료되는지 확인

## Supabase Dashboard 설정

### 카카오 Provider 설정
1. Supabase Dashboard > Authentication > Providers
2. Kakao 제공자 활성화
3. **Scopes**: 
   - 필수: `profile_nickname`
   - 선택: `account_email`, `profile_image`

### Redirect URI 설정
- Supabase Redirect URI를 Kakao Developers에 등록
- 예: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`

## 주의사항

1. **사용자 정보가 없어도 로그인 가능**
   - email이 없어도 정상 작동
   - profile_image가 없어도 정상 작동
   - nickname만 있으면 됨 (없으면 기본값 사용)

2. **프로필 설정**
   - 사용자가 나중에 프로필 정보를 추가할 수 있도록 UI 제공
   - `PUT /api/user/profile` API 사용

3. **에러 처리**
   - 사용자 생성 실패 시 상세한 로그 출력
   - 중복 사용자 에러 처리 추가

