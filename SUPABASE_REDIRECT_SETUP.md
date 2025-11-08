# Supabase Redirect URI 설정 완료 가이드

## ✅ 설정 완료된 Redirect URI

```
https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback
```

이 URI는 Supabase Dashboard에서 자동으로 생성된 표준 Redirect URI입니다.

## 📋 설정 확인 체크리스트

### 1. Supabase Dashboard 설정 확인

1. **Authentication > URL Configuration** 확인
   - Redirect URLs에 위 URI가 있는지 확인
   - Site URL 설정 확인

2. **Authentication > Providers > Kakao** 확인
   - Kakao 제공자가 활성화되어 있는지 확인
   - Client ID와 Client Secret이 입력되어 있는지 확인

### 2. Kakao Developers 설정 확인

1. **제품 설정 > 카카오 로그인 > Redirect URI 등록**
2. 다음 URI가 등록되어 있는지 확인:
   ```
   https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback
   ```
3. 정확히 일치해야 합니다 (대소문자, 슬래시 포함)

### 3. 프론트엔드 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**중요**: 
- `EXPO_PUBLIC_` 접두사 필수
- Supabase Dashboard > Settings > API에서 값 가져오기

## 🔄 로그인 플로우

1. 사용자가 "카카오로 시작하기" 버튼 클릭
2. `signInWithOAuth` 호출
3. Supabase가 카카오 로그인 페이지로 리다이렉트
4. 사용자가 카카오 계정으로 로그인
5. 카카오가 Supabase Redirect URI로 리다이렉트:
   ```
   https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback?code=...
   ```
6. Supabase가 인증 처리 후 앱으로 리다이렉트
7. 앱에서 세션 확인 및 로그인 완료

## 🧪 테스트 방법

### 1. 환경 변수 확인
```bash
# .env 파일 확인
cat .env
```

### 2. 앱 실행
```bash
npm start
```

### 3. 로그인 테스트
1. 앱에서 로그인 화면으로 이동
2. "카카오로 시작하기" 버튼 클릭
3. 카카오 로그인 웹뷰가 열림
4. 카카오 계정으로 로그인
5. 자동으로 앱으로 리다이렉트되어 로그인 완료

## ⚠️ 문제 해결

### 문제: "Invalid redirect URI"
- Kakao Developers에 등록한 Redirect URI가 정확히 일치하는지 확인
- 대소문자, 슬래시까지 모두 일치해야 함
- 공백이 포함되지 않았는지 확인

### 문제: 앱으로 리다이렉트되지 않음
- `app.json`의 `scheme: "drdang"` 확인
- Supabase Dashboard > Authentication > URL Configuration에서 Site URL 확인
- 앱을 재빌드해야 할 수 있음

### 문제: 환경 변수가 적용되지 않음
- `.env` 파일이 프로젝트 루트에 있는지 확인
- `EXPO_PUBLIC_` 접두사 확인
- 앱 완전히 재시작 (Metro bundler 캐시 클리어: `npx expo start -c`)

## 📝 현재 설정 요약

- **Supabase Project**: `zhntmviycucdvupiccoa`
- **Redirect URI**: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`
- **앱 스킴**: `drdang://`
- **환경 변수**: `.env` 파일에 `EXPO_PUBLIC_SUPABASE_URL` 설정 필요

## ✅ 다음 단계

1. `.env` 파일 생성 및 Supabase 값 입력
2. 앱 재시작
3. 로그인 테스트

