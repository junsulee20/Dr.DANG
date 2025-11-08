# Supabase 카카오 로그인 설정 가이드

## 1. Supabase Dashboard에서 카카오 OAuth 설정

### 1.1 Authentication > Providers로 이동
1. Supabase Dashboard 접속
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **Providers** 탭 선택

### 1.2 카카오 제공자 활성화
1. **Kakao** 제공자 찾기
2. **Enable Kakao** 토글을 켜기

### 1.3 카카오 앱 정보 입력
다음 정보를 입력해야 합니다:

#### 필요한 정보 (Kakao Developers에서 가져오기)
1. **Kakao Developers** 접속: https://developers.kakao.com/
2. 내 애플리케이션 선택
3. **앱 키** 메뉴에서:
   - **REST API 키** → `Client ID (REST API Key)`에 입력
4. **제품 설정 > 카카오 로그인 > 보안** 메뉴에서:
   - **Client Secret** → `Client Secret`에 입력

### 1.4 Redirect URI 설정
Supabase에서 제공하는 Redirect URI를 Kakao Developers에 등록해야 합니다.

#### Supabase Redirect URI 확인
1. Supabase Dashboard > Authentication > URL Configuration
2. **Redirect URLs** 섹션에서 확인
   - 예: `https://your-project.supabase.co/auth/v1/callback`
   - 또는: `https://[프로젝트-참조].supabase.co/auth/v1/callback`

#### Kakao Developers에 Redirect URI 등록
1. Kakao Developers > 내 애플리케이션
2. **제품 설정 > 카카오 로그인 > Redirect URI 등록**
3. **+ 추가** 버튼 클릭
4. Supabase Redirect URI 입력:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   - `[your-project-ref]`는 Supabase 프로젝트 참조 ID입니다
   - 예: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`

### 1.5 추가 설정 (선택사항)
- **Scopes**: 필요한 권한 선택
  - `profile_nickname` (닉네임)
  - `account_email` (이메일)
  - `profile_image` (프로필 사진)

## 2. Supabase URL Configuration 확인

### 2.1 Site URL 설정
1. Authentication > URL Configuration
2. **Site URL** 확인/설정:
   - 개발: `http://localhost:3000` 또는 앱 스킴 `drdang://`
   - 프로덕션: 실제 도메인

### 2.2 Redirect URLs 추가
앱에서 사용할 Redirect URL 추가:
- `drdang://auth/callback` (모바일 앱용)
- `exp://localhost:8081/--/auth/callback` (Expo 개발용)

## 3. 필요한 정보 정리

### Supabase에서 필요한 정보
- ✅ Supabase Project URL
- ✅ Supabase Anon Key
- ✅ Redirect URI (자동 생성됨)

### Kakao Developers에서 필요한 정보
- ✅ REST API Key (Client ID)
- ✅ Client Secret
- ✅ Redirect URI (Supabase에서 제공하는 것)

## 4. 설정 완료 확인

설정이 완료되면:
1. Supabase Dashboard에서 **Kakao** 제공자가 활성화되어 있는지 확인
2. Kakao Developers에서 Redirect URI가 등록되어 있는지 확인
3. 테스트 로그인 시도

## 5. 문제 해결

### 문제: "Invalid redirect URI"
- Kakao Developers에 등록한 Redirect URI와 Supabase의 Redirect URI가 정확히 일치해야 합니다
- 대소문자, 슬래시, 프로토콜까지 모두 일치해야 합니다

### 문제: "Client ID or Secret is incorrect"
- REST API Key와 Client Secret이 정확한지 확인
- 복사/붙여넣기 시 공백이 포함되지 않았는지 확인

### 문제: "OAuth provider not enabled"
- Supabase Dashboard에서 Kakao 제공자가 활성화되어 있는지 확인

