# 앱 실행 가이드

## 🚀 빠른 시작

### 1단계: 백엔드 서버 실행

터미널 1에서:
```bash
cd /home/sean/next/drdang/Dr.DANG/server
npm run dev
```

서버가 실행되면:
```
🚀 Server is running on http://localhost:3001
```

### 2단계: 프론트엔드 실행

터미널 2에서:
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

## ✅ 실행 전 확인사항

### 필수 환경 변수

#### 프론트엔드 (`.env`)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정됨

#### 백엔드 (`server/.env`)
- [ ] `SUPABASE_URL` 설정됨
- [ ] `SUPABASE_ANON_KEY` 설정됨
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정됨
- [ ] `JWT_SECRET` 설정됨
- [ ] `OPENAI_API_KEY` 설정됨 (음식 분석 기능용)

### 데이터베이스 확인
- [ ] Supabase 마이그레이션 실행됨
- [ ] Storage 버킷 `food-images` 생성됨

## 🧪 테스트 순서

1. **백엔드 Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Swagger UI 확인**
   - 브라우저에서 `http://localhost:3001/api-docs` 접속

3. **앱 실행**
   - Expo Go 앱에서 QR 코드 스캔
   - 또는 시뮬레이터/에뮬레이터 사용

4. **로그인 테스트**
   - 카카오 로그인 버튼 클릭
   - 로그인 완료 확인

5. **음식 분석 테스트**
   - 이미지 선택/촬영
   - 분석 결과 확인

## 📱 실행 방법

### Expo Go 사용
```bash
npm start
# QR 코드 스캔
```

### iOS 시뮬레이터
```bash
npm run ios
```

### Android 에뮬레이터
```bash
npm run android
```

### 웹 브라우저
```bash
npm run web
```

## ⚠️ 주의사항

1. **백엔드 서버가 먼저 실행되어야 함**
   - 프론트엔드가 API를 호출하므로 백엔드가 실행 중이어야 합니다

2. **환경 변수 재시작**
   - 환경 변수를 변경한 후에는 앱을 완전히 재시작해야 합니다

3. **네트워크 연결**
   - 로컬호스트는 같은 네트워크에서만 접근 가능합니다
   - 실제 기기에서 테스트할 때는 IP 주소 사용 필요

## 🔍 문제 해결

### 백엔드 연결 실패
- 백엔드 서버가 실행 중인지 확인
- 포트 3001이 사용 가능한지 확인
- 방화벽 설정 확인

### 인증 실패
- Supabase 환경 변수 확인
- Supabase Dashboard에서 설정 확인

### 이미지 업로드 실패
- Supabase Storage 버킷 확인
- 파일 크기 제한 확인 (10MB)

