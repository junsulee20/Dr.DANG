# Dr. DANG 설정 가이드

## 📋 개요

Dr. DANG 프로젝트의 백엔드 및 프론트엔드 설정 가이드입니다.

## 🔧 백엔드 설정

### 1. 환경 변수 설정

백엔드 `.env` 파일은 이미 생성되어 있습니다 (`backend/.env`).

필요한 경우 카카오 OAuth 설정을 업데이트하세요:

```env
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

### 2. Supabase 데이터베이스 설정

#### 2.1. Supabase Dashboard 접속

1. [https://supabase.com](https://supabase.com) 로그인
2. 프로젝트 선택 (URL: `https://zhntmviycucdvupiccoa.supabase.co`)

#### 2.2. 데이터베이스 스키마 생성

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 클릭
3. `backend/database/schema.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

이렇게 하면 다음 테이블들이 생성됩니다:
- `users` - 사용자 정보
- `meal_records` - 식단 기록

#### 2.3. Storage Bucket 생성

1. 왼쪽 메뉴에서 **Storage** 클릭
2. **New bucket** 클릭
3. 다음 정보로 버킷 생성:
   - **Name**: `food-images`
   - **Public**: ❌ **체크 해제** (Private bucket)
4. **Create bucket** 클릭

#### 2.4. Storage Policies 설정 (선택사항)

1. `food-images` 버킷 선택
2. **Policies** 탭 클릭
3. 다음 정책들을 추가:

**업로드 정책:**
```sql
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'food-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**조회 정책:**
```sql
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'food-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 3. 백엔드 서버 실행

```bash
cd backend
npm run dev
```

서버가 실행되면 다음과 같이 표시됩니다:
```
🚀 Server is running on http://localhost:3001
📝 Environment: development
✅ Health check: http://localhost:3001/health
```

### 4. 헬스체크 테스트

브라우저나 curl로 테스트:

```bash
curl http://localhost:3001/health
```

응답:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

## 📱 프론트엔드 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env` 파일 생성:

```env
API_URL=http://localhost:3001
OPENAI_API_KEY=your_openai_key_here
```

> **참고**: API_URL을 설정하지 않으면 기본값 `http://localhost:3001`이 사용됩니다.

### 3. 앱 실행

```bash
npm start
```

또는 특정 플랫폼:

```bash
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## 🔐 카카오 OAuth 설정 (선택사항)

카카오 로그인을 사용하려면:

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 및 설정
3. Client ID와 Client Secret 발급
4. Redirect URI 설정: `http://localhost:3001/auth/kakao/callback`
5. `backend/.env`에 설정 추가

## 📡 API 엔드포인트

백엔드 API는 다음 엔드포인트를 제공합니다:

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

## 🧪 API 테스트 예시

### 음식 분석 API 테스트 (curl)

```bash
curl -X POST http://localhost:3001/api/food/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/food-image.jpg"
```

### 식단 기록 조회 (curl)

```bash
curl -X GET "http://localhost:3001/api/records?date=2025-11-10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 트러블슈팅

### 백엔드 서버가 시작되지 않는 경우

1. `.env` 파일이 `backend/` 디렉토리에 있는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. `node_modules` 재설치: `rm -rf node_modules && npm install`

### Supabase 연결 오류

1. SUPABASE_URL과 키들이 올바른지 확인
2. Supabase Dashboard에서 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 확인

### 이미지 업로드 오류

1. Storage Bucket `food-images`가 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 이미지 크기가 10MB 이하인지 확인

## 📚 다음 단계

백엔드 설정이 완료되면:

1. ✅ 백엔드 서버 실행
2. ✅ Supabase 데이터베이스 스키마 생성
3. ✅ Storage Bucket 생성
4. ⏭️ 프론트엔드 화면들을 백엔드 API와 연결
5. ⏭️ 카카오 로그인 통합 (선택사항)

## 💡 참고 문서

- [Supabase 공식 문서](https://supabase.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Expo 공식 문서](https://docs.expo.dev/)

