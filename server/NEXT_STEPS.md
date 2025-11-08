# 다음 단계 가이드

## ✅ 완료된 작업
- [x] 데이터베이스 테이블 생성 완료

## 📋 다음 해야 할 작업

### 1. Supabase Storage 버킷 생성

1. Supabase Dashboard로 이동
2. 왼쪽 메뉴에서 **Storage** 클릭
3. **New bucket** 버튼 클릭
4. 다음 설정 입력:
   - **Name**: `food-images`
   - **Public bucket**: ✅ 체크 (Public으로 설정)
5. **Create bucket** 클릭
6. 버킷 생성 후, **Settings** 탭에서:
   - **File size limit**: `10 MB` 설정
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp` 입력

### 2. 환경 변수 설정

1. `server` 폴더에 `.env` 파일 생성
2. 다음 내용을 복사하여 붙여넣기:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT
JWT_SECRET=your_very_secret_jwt_key_min_32_characters_long

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
KAKAO_REDIRECT_URI=http://localhost:3001/auth/kakao/callback
```

3. Supabase 키 가져오기:
   - Supabase Dashboard > **Settings** > **API**
   - **Project URL** → `SUPABASE_URL`에 복사
   - **anon public** 키 → `SUPABASE_ANON_KEY`에 복사
   - **service_role secret** 키 → `SUPABASE_SERVICE_ROLE_KEY`에 복사

### 3. 서버 의존성 설치 및 실행

터미널에서 다음 명령어 실행:

```bash
cd server
npm install
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 4. 테스트

브라우저에서 다음 URL 접속:
```
http://localhost:3001/health
```

다음과 같은 응답이 나오면 성공:
```json
{
  "status": "ok",
  "message": "Dr.DANG Backend API is running"
}
```

## 🔑 필요한 키 발급 가이드

### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 로그인 후 **API keys** 메뉴
3. **Create new secret key** 클릭
4. 키 복사하여 `.env`의 `OPENAI_API_KEY`에 설정

### Kakao OAuth
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 설정 > 플랫폼 > Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3001`
4. 제품 설정 > 카카오 로그인 활성화
5. Redirect URI 등록: `http://localhost:3001/auth/kakao/callback`
6. 앱 키 > REST API 키 → `KAKAO_CLIENT_ID`
7. 제품 설정 > 카카오 로그인 > 보안 > Client Secret → `KAKAO_CLIENT_SECRET`

### JWT Secret
- 최소 32자 이상의 랜덤 문자열 사용
- 예: `openssl rand -base64 32` 명령어로 생성 가능

