# 프론트엔드-백엔드 통합 테스트 가이드

## 🚀 앱 실행 전 체크리스트

### 1. 환경 변수 설정 확인

#### 프론트엔드 (`.env` 파일)
```env
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:3001
```

#### 백엔드 (`server/.env` 파일)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. 의존성 설치

#### 프론트엔드
```bash
cd /home/sean/next/drdang/Dr.DANG
npm install
```

#### 백엔드
```bash
cd server
npm install
```

### 3. 서버 실행

#### 백엔드 서버 실행 (터미널 1)
```bash
cd server
npm run dev
```

서버가 `http://localhost:3001`에서 실행되는지 확인:
```bash
curl http://localhost:3001/health
```

#### 프론트엔드 실행 (터미널 2)
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

## 🧪 통합 테스트 시나리오

### 테스트 1: 서버 연결 확인
1. 백엔드 서버 실행 확인
2. Health check: `curl http://localhost:3001/health`
3. Swagger UI: `http://localhost:3001/api-docs`

### 테스트 2: 인증 플로우
1. 앱 실행
2. 로그인 화면 확인
3. "카카오로 시작하기" 버튼 클릭
4. 카카오 로그인 완료
5. 메인 화면으로 자동 이동 확인

### 테스트 3: 음식 분석 플로우
1. 메인 화면에서 "카메라" 또는 "갤러리" 버튼 클릭
2. 이미지 선택/촬영
3. 로딩 화면에서 분석 진행 확인
4. 결과 화면 확인

### 테스트 4: API 연동 확인
1. Swagger UI에서 API 테스트
2. 또는 프론트엔드에서 실제 기능 사용

## 🔧 문제 해결

### 문제: 백엔드 서버가 시작되지 않음
- `.env` 파일 확인
- 포트 3001이 사용 중인지 확인: `lsof -i :3001`
- 의존성 설치 확인: `cd server && npm install`

### 문제: 프론트엔드에서 API 호출 실패
- 백엔드 서버가 실행 중인지 확인
- `EXPO_PUBLIC_API_URL` 환경 변수 확인
- 네트워크 연결 확인 (로컬호스트)

### 문제: 인증 실패
- Supabase 환경 변수 확인
- Supabase Dashboard에서 Kakao 제공자 활성화 확인
- Redirect URI 설정 확인

### 문제: 이미지 업로드 실패
- 백엔드 서버 로그 확인
- 이미지 파일 크기 확인 (10MB 제한)
- Supabase Storage 버킷 설정 확인

## 📊 테스트 결과 확인

### 백엔드 로그 확인
서버 터미널에서 다음을 확인:
- API 요청 로그
- 에러 메시지
- 데이터베이스 쿼리 결과

### 프론트엔드 로그 확인
Expo 개발자 도구에서:
- 콘솔 로그
- 네트워크 요청
- 에러 메시지

### Supabase Dashboard 확인
- Table Editor에서 데이터 확인
- Storage에서 업로드된 이미지 확인
- Authentication에서 사용자 확인

