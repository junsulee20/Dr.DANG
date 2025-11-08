# 프론트엔드 환경 변수 설정 가이드

## 📋 방법 1: .env 파일 사용 (권장)

### 1. .env 파일 생성

프로젝트 루트 디렉토리(`/home/sean/next/drdang/Dr.DANG/`)에 `.env` 파일을 생성하세요:

```bash
cd /home/sean/next/drdang/Dr.DANG
touch .env
```

### 2. 환경 변수 입력

`.env` 파일에 다음 내용을 입력하세요:

```env
# Supabase 설정
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 백엔드 API URL (선택사항)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**중요**: 
- `EXPO_PUBLIC_` 접두사가 **필수**입니다!
- 이 접두사가 없으면 클라이언트에서 접근할 수 없습니다.

### 3. 실제 값 입력

#### Supabase 값 가져오기
1. Supabase Dashboard 접속
2. **Settings > API** 메뉴
3. 다음 값 복사:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### 예시
```env
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 4. .gitignore 확인

`.env` 파일이 `.gitignore`에 포함되어 있는지 확인하세요 (보안상 중요):

```bash
# .gitignore에 다음이 있어야 합니다
.env
.env.local
```

### 5. 앱 재시작

환경 변수 변경 후에는 **반드시 앱을 재시작**해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm start
```

## 📋 방법 2: app.config.js 사용

`app.config.js`에서 환경 변수를 설정할 수도 있습니다:

```javascript
export default {
  expo: {
    // ... 기존 설정
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    },
  },
};
```

그리고 코드에서 사용:
```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
```

## 🔍 환경 변수 확인 방법

### 1. 코드에서 확인
```typescript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

### 2. 앱 실행 시 확인
앱을 실행하고 콘솔 로그를 확인하세요.

## ⚠️ 주의사항

### 1. EXPO_PUBLIC_ 접두사 필수
- 클라이언트에서 접근 가능한 환경 변수는 `EXPO_PUBLIC_`로 시작해야 합니다
- 이 접두사가 없으면 `undefined`가 됩니다

### 2. 보안
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.env.example` 파일만 커밋하여 다른 개발자에게 필요한 변수를 알려주세요

### 3. 재시작 필요
- 환경 변수를 변경한 후에는 반드시 앱을 재시작해야 합니다
- Hot Reload로는 환경 변수가 업데이트되지 않습니다

### 4. 프로덕션 배포
- EAS Build를 사용하는 경우, EAS Secrets에 환경 변수를 설정하세요
- 또는 `app.config.js`에서 `extra` 필드 사용

## 🚀 빠른 설정 체크리스트

- [ ] 프로젝트 루트에 `.env` 파일 생성
- [ ] `EXPO_PUBLIC_SUPABASE_URL` 설정
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 앱 재시작 (`npm start`)
- [ ] 콘솔에서 환경 변수 확인

## 📝 예시 .env 파일

```env
# ============================================
# Supabase 설정
# ============================================
# Supabase Dashboard > Settings > API에서 가져오기
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnRtdml5Y3VjZHZ1cGljY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDk3OTIsImV4cCI6MjA3NzcyNTc5Mn0.Ui1FeI3nAZ4mDuUPcFWjUpqMfShk-w1Vd4JbDQQUqjI

# ============================================
# 백엔드 API URL
# ============================================
# 개발: http://localhost:3001
# 프로덕션: 실제 백엔드 URL
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## 🔧 문제 해결

### 환경 변수가 undefined로 나옴
1. `EXPO_PUBLIC_` 접두사 확인
2. 앱 재시작 확인
3. `.env` 파일 위치 확인 (프로젝트 루트에 있어야 함)
4. 파일 이름 확인 (`.env` 정확히)

### 환경 변수가 적용되지 않음
1. 앱 완전히 종료 후 재시작
2. Metro bundler 캐시 클리어: `npx expo start -c`
3. `node_modules` 삭제 후 재설치

