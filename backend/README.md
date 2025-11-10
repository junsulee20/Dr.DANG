# Dr. DANG Backend API

백엔드 API 서버입니다.

## 🚀 시작하기

### 1. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요한 경우 수정하세요.

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 2. 데이터베이스 스키마 생성

1. Supabase Dashboard에 로그인
2. SQL Editor로 이동
3. `database/schema.sql` 파일의 내용을 복사하여 실행

### 3. Storage Bucket 생성

1. Supabase Dashboard → Storage
2. 새 버킷 생성:
   - 이름: `food-images`
   - Public: `false` (체크 해제)
3. Policies 설정 (선택사항)

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 📡 API 엔드포인트

### 인증

- `POST /auth/kakao` - 카카오 로그인

### 음식 분석

- `POST /api/food/analyze` - 음식 사진 분석

### 식단 기록

- `GET /api/records?date=YYYY-MM-DD` - 특정 날짜 기록 조회
- `GET /api/records?month=YYYY-MM` - 월별 기록 조회
- `POST /api/records` - 식단 기록 생성
- `DELETE /api/records/:id` - 식단 기록 삭제

### 사용자 프로필

- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정

## 🔐 인증

대부분의 API는 JWT 토큰이 필요합니다:

```
Authorization: Bearer {token}
```

## 📝 에러 응답 형식

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지",
    "details": {}
  }
}
```

## 🛠 기술 스택

- Express.js
- TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- OpenAI GPT-4 Vision API

