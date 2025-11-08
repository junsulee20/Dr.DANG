# 환경 변수 설정 가이드

## 프론트엔드 환경 변수

프론트엔드 루트 디렉토리(`/home/sean/next/drdang/Dr.DANG/`)에 `.env` 파일이 필요합니다.

### .env 파일 생성

프론트엔드 루트에 `.env` 파일을 만들고 다음 내용을 추가하세요:

```env
# Supabase 설정 (프론트엔드)
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API URL (개발 환경)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 주의사항

1. **EXPO_PUBLIC_ 접두사**: Expo에서는 클라이언트에서 접근 가능한 환경 변수에 `EXPO_PUBLIC_` 접두사가 필요합니다.

2. **앱 재시작**: `.env` 파일을 수정한 후에는 Expo 개발 서버를 완전히 재시작해야 합니다:
   ```bash
   # Ctrl+C로 서버 중지 후
   npm start
   ```

3. **app.config.js**: `app.config.js`에도 기본값이 설정되어 있어서, `.env` 파일이 없어도 작동할 수 있습니다. 하지만 프로덕션 환경에서는 `.env` 파일을 사용하는 것이 좋습니다.

## 백엔드 환경 변수

백엔드 환경 변수는 `server/.env` 파일에 설정되어 있습니다.

### 필요한 환경 변수

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (서버 전용)
- `JWT_SECRET`: JWT 토큰 서명용 시크릿
- `OPENAI_API_KEY`: OpenAI API 키 (음식 분석용)

## 문제 해결

### 환경 변수가 로드되지 않음

1. `.env` 파일이 올바른 위치에 있는지 확인
2. 파일 이름이 정확히 `.env`인지 확인 (`.env.local` 등이 아님)
3. Expo 개발 서버를 완전히 재시작
4. `app.config.js`의 `extra` 필드에 기본값이 설정되어 있는지 확인

### Supabase 연결 실패

1. Supabase URL과 Anon Key가 올바른지 확인
2. Supabase Dashboard에서 프로젝트 설정 확인
3. 네트워크 연결 확인

