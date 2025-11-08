# 카카오 로그인 테스트 가이드

## 카카오 로그인은 Expo에서 테스트 가능합니다! ✅

### 웹 브라우저에서 테스트 (가장 간단)

#### 1. 웹에서 앱 실행
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
# 터미널에서 'w' 키 누르기
```

#### 2. 카카오 로그인 테스트
1. 웹 브라우저에서 로그인 화면 표시됨
2. "카카오로 시작하기" 버튼 클릭
3. 카카오 로그인 페이지로 이동
4. 로그인 완료 후 앱으로 리다이렉트

#### 3. Deep Linking 처리
- 웹에서는 URL redirect로 처리됨
- `lib/supabase.ts`에서 `detectSessionInUrl: Platform.OS === 'web'` 설정
- Supabase가 자동으로 URL에서 세션 감지

### iOS 시뮬레이터에서 테스트 (권장)

```bash
npm start
# 터미널에서 'i' 키 누르기
```

- Mac이 있어야 함
- Xcode 설치 필요
- Deep linking이 완벽하게 작동

### Android 에뮬레이터에서 테스트

```bash
npm start
# 터미널에서 'a' 키 누르기
```

- Android Studio 설치 필요
- AVD (Android Virtual Device) 설정
- Deep linking이 완벽하게 작동

### 실제 모바일 기기에서 테스트

#### WSL2에서 직접 테스트하는 방법:

**옵션 1: Expo의 Tunnel 모드 (간단)**
```bash
npm start -- --tunnel
```
- QR 코드 스캔
- Tunnel이 느리거나 타임아웃되면 다른 방법 사용

**옵션 2: ngrok 사용 (안정적)**
```bash
# 터미널 1
npm start

# 터미널 2
npm install -g ngrok
ngrok http 8081

# ngrok URL을 Expo Go에서 입력
```

## 카카오 로그인 작동 방식

### 1. 로그인 버튼 클릭
```typescript
// app/login.tsx
await login(); // AuthContext의 login 함수 호출
```

### 2. Supabase OAuth 시작
```typescript
// lib/supabase.ts
await supabase.auth.signInWithOAuth({
  provider: 'kakao',
  options: {
    redirectTo: 'https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback',
  },
});
```

### 3. 카카오 로그인 페이지 열림
- 웹 브라우저 또는 WebView 열림
- 카카오 계정으로 로그인
- 동의 항목 선택 (닉네임만)

### 4. Redirect 처리
- **웹**: URL redirect로 세션 전달
- **모바일**: Deep link로 앱으로 돌아옴 (`drdang://auth/callback`)

### 5. 세션 저장
- `AuthContext`에서 세션 감지
- `onAuthStateChange` 리스너가 세션 업데이트
- 자동으로 메인 화면으로 이동

## 웹에서 카카오 로그인 테스트 가능? Yes! ✅

웹 브라우저에서도 완벽하게 작동합니다:
- OAuth 로그인: 웹 브라우저에서 정상 작동
- Redirect: URL로 처리
- 세션 저장: localStorage 사용

### 웹 테스트 장점
- WSL2에서 바로 테스트 가능
- 빠른 피드백
- 디버깅이 쉬움 (브라우저 개발자 도구)

### 웹 테스트 제한사항
- Deep linking 테스트는 불가 (웹에서는 URL redirect)
- 카메라 기능 제한적 (파일 선택만 가능)
- 네이티브 API 일부 제한

## 모바일 vs 웹 비교

| 기능 | 웹 | 모바일 (Expo Go) | 시뮬레이터 |
|------|----|--------------------|------------|
| 카카오 로그인 | ✅ | ✅ | ✅ |
| OAuth Redirect | ✅ | ✅ | ✅ |
| Deep Linking | ⚠️ | ✅ | ✅ |
| 카메라 | ⚠️ | ✅ | ⚠️ |
| 갤러리 | ✅ | ✅ | ✅ |
| 디버깅 | ✅ | ⚠️ | ✅ |

## 권장 테스트 순서

### 1. 웹에서 기본 테스트 (지금)
```bash
npm start
# 'w' 키로 웹 실행
```
- 카카오 로그인 작동 확인
- UI 확인
- 기본 흐름 확인

### 2. 시뮬레이터에서 테스트 (선택)
```bash
npm start
# 'i' (iOS) 또는 'a' (Android)
```

### 3. 실제 모바일에서 테스트 (최종)
```bash
# Tunnel 모드
npm start -- --tunnel

# 또는 ngrok
npm start
ngrok http 8081
```

## 지금 바로 웹에서 카카오 로그인 테스트

```bash
npm start
# 'w' 키 누르기
```

1. 브라우저에서 앱 열림
2. 로그인 화면에서 "카카오로 시작하기" 클릭
3. 카카오 로그인 완료
4. 앱으로 리다이렉트 확인

**웹에서 카카오 로그인이 작동하면, 모바일에서도 작동합니다!**

Tunnel 타임아웃 문제는 별개이므로, 웹에서 먼저 테스트하시는 것을 권장합니다.

