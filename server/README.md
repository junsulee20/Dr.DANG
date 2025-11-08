# Dr.DANG Backend API

Dr.DANG 앱의 백엔드 API 서버입니다.

## 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env` 파일을 생성하고 `.env.example`을 참고하여 필요한 값들을 설정하세요.

## 실행

개발 모드:
```bash
npm run dev
```

프로덕션 빌드:
```bash
npm run build
npm start
```

## API 엔드포인트

### 인증
- `POST /auth/kakao` - 카카오 로그인

### 음식 분석
- `POST /api/food/analyze` - 음식 이미지 분석

### 식단 기록
- `GET /api/records` - 식단 기록 조회
- `POST /api/records` - 식단 기록 생성

### 프로필
- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정

## 필요한 환경 변수

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase 익명 키
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키
- `OPENAI_API_KEY`: OpenAI API 키
- `KAKAO_CLIENT_ID`: 카카오 OAuth 클라이언트 ID
- `KAKAO_CLIENT_SECRET`: 카카오 OAuth 클라이언트 시크릿
- `JWT_SECRET`: JWT 토큰 서명용 시크릿 키

