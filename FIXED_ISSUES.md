# 해결된 문제들

## 1. 포트 3001 이미 사용 중 오류

### 문제
```
Error: listen EADDRINUSE: address already in use :::3001
```

### 해결 방법
```bash
# 포트 3001을 사용하는 프로세스 종료
lsof -ti:3001 | xargs kill -9
```

### 포트 설명
- **백엔드 서버**: 포트 3001 (Express API 서버)
- **프론트엔드 서버**: 포트 8081 (Expo Metro 번들러)
- 두 포트는 서로 다른 용도이므로 **상관없습니다** ✅

## 2. 웹에서 "window is not defined" 오류

### 문제
```
ReferenceError: window is not defined
at getValue (/node_modules/@react-native-async-storage/async-storage/...)
```

### 원인
- `@react-native-async-storage/async-storage`는 네이티브 환경용
- 웹 환경(SSR)에서는 `window` 객체가 없어서 에러 발생
- Supabase 클라이언트가 초기화될 때 스토리지에 접근하려고 함

### 해결 방법
- 웹 환경: `localStorage` 사용
- 네이티브 환경: `AsyncStorage` 사용
- 플랫폼에 따라 동적으로 스토리지 선택

### 수정된 코드
`lib/supabase.ts`에서 플랫폼별 스토리지를 자동으로 선택하도록 수정했습니다.

## 실행 방법

### 1. 백엔드 서버 시작 (터미널 1)
```bash
cd /home/sean/next/drdang/Dr.DANG/server
npm run dev
```

### 2. 프론트엔드 서버 시작 (터미널 2)
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

### 3. 앱 실행
- **모바일**: Expo Go 앱에서 QR 코드 스캔
- **웹**: 브라우저에서 `w` 키 누르기 또는 `http://localhost:8081` 접속

## 참고사항

### 웹에서 실행 시
- `npm start` 후 `w` 키를 눌러 웹 브라우저에서 실행
- 또는 `npm run web` 명령어 사용

### 네이티브에서 실행 시
- `npm start` 후 `i` (iOS) 또는 `a` (Android) 키 누르기
- 또는 Expo Go 앱에서 QR 코드 스캔

### 환경 변수
- `.env` 파일이 없어도 `app.config.js`의 기본값으로 작동합니다
- Supabase 설정이 정상적으로 로드되는지 콘솔에서 확인 가능합니다

