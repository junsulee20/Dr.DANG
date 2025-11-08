# 카카오 로그인 KOE205 에러 해결 가이드

## KOE205 에러 원인
"잘못된 요청 (KOE205)" 에러는 주로 다음 원인으로 발생합니다:
1. **Redirect URI 불일치**
2. **카카오 앱 설정 오류**
3. **필수 동의 항목 설정 문제**

## 해결 방법

### 1. Supabase Dashboard 설정 (가장 중요)

#### 1.1 Authentication > Providers에서 카카오 설정
1. Supabase Dashboard 접속
2. **Authentication** > **Providers** 이동
3. **Kakao** 제공자 찾기
4. **Enable Kakao** 토글 활성화

#### 1.2 카카오 앱 정보 입력
- **Client ID (REST API Key)**: Kakao Developers에서 가져온 REST API 키
- **Client Secret**: Kakao Developers에서 가져온 Client Secret

#### 1.3 Redirect URI 확인
- Supabase가 제공하는 Redirect URI 확인
- 예: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`

### 2. Kakao Developers 콘솔 설정

#### 2.1 Redirect URI 등록 (필수)
1. Kakao Developers 접속: https://developers.kakao.com/
2. 내 애플리케이션 선택
3. **제품 설정** > **카카오 로그인** > **Redirect URI 등록**
4. Supabase Redirect URI 추가:
   ```
   https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback
   ```

#### 2.2 동의 항목 설정 (중요!)
1. **제품 설정** > **카카오 로그인** > **동의항목** 이동
2. **선택 동의** 항목만 활성화:
   - ✅ **닉네임** (profile_nickname) - 선택 동의
   - ❌ 이메일 (account_email) - 비활성화
   - ❌ 프로필 사진 (profile_image) - 비활성화

#### 2.3 카카오 로그인 활성화
1. **제품 설정** > **카카오 로그인** > **활성화 설정**
2. **카카오 로그인** 활성화
3. **OpenID Connect** 활성화 (선택사항)

### 3. Supabase Dashboard에서 Scopes 설정

#### 3.1 카카오 Provider 설정에서 Scopes 확인
Supabase Dashboard > Authentication > Providers > Kakao에서:
- Scopes가 제대로 설정되어 있는지 확인
- 기본적으로 `profile_nickname`만 포함되어야 함

#### 3.2 코드에서 Scopes 명시 (선택사항)
필요시 `lib/supabase.ts`에서 scopes를 명시적으로 설정:

```typescript
export async function signInWithKakao() {
  const redirectTo = getDeepLinkUrl();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
      queryParams: {
        // profile_nickname만 요청
        // 다른 scopes는 요청하지 않음
      },
    },
  });

  if (error) {
    console.error('[Kakao Login Error]', error);
    throw error;
  }

  return data;
}
```

## 체크리스트

### Supabase Dashboard
- [ ] 카카오 Provider 활성화
- [ ] Client ID (REST API Key) 입력
- [ ] Client Secret 입력
- [ ] Redirect URI 확인: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`

### Kakao Developers
- [ ] Redirect URI 등록: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`
- [ ] 동의 항목 설정: 닉네임만 선택 동의
- [ ] 카카오 로그인 활성화
- [ ] REST API 키 확인
- [ ] Client Secret 확인

### 코드
- [ ] `lib/supabase.ts`에서 카카오 로그인 함수 확인
- [ ] `server/src/middleware/supabaseAuth.ts`에서 optional 필드 처리 확인

## SQL 스키마 수정 필요 여부

**답: 수정 불필요합니다.**

현재 스키마는 이미 optional 필드를 지원합니다:
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

따라서 SQL Editor에서 수정할 필요가 없습니다.

## 테스트 방법

### 1. 설정 확인
1. Supabase Dashboard에서 카카오 Provider 설정 확인
2. Kakao Developers에서 Redirect URI 확인
3. 동의 항목이 닉네임만 설정되어 있는지 확인

### 2. 로그인 테스트
1. 앱에서 카카오 로그인 버튼 클릭
2. 카카오 로그인 화면에서 닉네임만 동의
3. 로그인 완료 확인

### 3. 에러 로그 확인
- Supabase Dashboard > Logs에서 에러 확인
- 브라우저 콘솔에서 에러 확인
- 백엔드 서버 로그에서 에러 확인

## 추가 문제 해결

### 문제: Redirect URI 불일치
**해결**: Kakao Developers에서 정확한 Redirect URI 등록
- Supabase Redirect URI와 완전히 일치해야 함
- HTTP/HTTPS 구분 확인
- 마지막 슬래시(/) 확인

### 문제: Client Secret 오류
**해결**: 
1. Kakao Developers에서 Client Secret 재생성
2. Supabase Dashboard에 새 Client Secret 입력

### 문제: 동의 항목 오류
**해결**:
1. Kakao Developers에서 동의 항목을 닉네임만 설정
2. 다른 동의 항목 비활성화

## 참고

- KOE205 에러는 대부분 Redirect URI 또는 카카오 앱 설정 문제입니다
- SQL 스키마는 수정할 필요가 없습니다
- profile_nickname만 받아도 로그인이 정상적으로 작동합니다

