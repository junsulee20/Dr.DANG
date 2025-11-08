# 🚀 빠른 시작 가이드

## 1단계: 백엔드 서버 실행

터미널 1에서:
```bash
cd /home/sean/next/drdang/Dr.DANG/server
npm run dev
```

서버가 정상적으로 실행되면:
```
🚀 Server is running on http://localhost:3001
```

## 2단계: 프론트엔드 앱 실행

터미널 2에서:
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

## 3단계: 앱 접속

- **Expo Go**: QR 코드 스캔
- **iOS 시뮬레이터**: `i` 키 누르기
- **Android 에뮬레이터**: `a` 키 누르기
- **웹 브라우저**: `w` 키 누르기

## ✅ 체크리스트

### 환경 변수 확인
- [ ] 프론트엔드 `.env` 파일 존재 (선택사항, app.config.js에 설정 가능)
- [ ] 백엔드 `server/.env` 파일 존재 및 모든 키 설정됨

### 서버 확인
- [ ] 백엔드 서버가 `http://localhost:3001`에서 실행 중
- [ ] Health check: `curl http://localhost:3001/health` 성공
- [ ] Swagger UI: `http://localhost:3001/api-docs` 접속 가능

### 앱 테스트
1. **로그인 테스트**
   - 앱 실행 → 로그인 화면 확인
   - "카카오로 시작하기" 클릭
   - 카카오 로그인 완료
   - 메인 화면으로 이동 확인

2. **음식 분석 테스트**
   - 메인 화면에서 "카메라" 또는 "갤러리" 버튼 클릭
   - 이미지 선택/촬영
   - 로딩 화면에서 분석 진행 확인
   - 결과 화면 확인

## 🔧 문제 해결

### 백엔드 서버가 시작되지 않음
```bash
# 포트 확인
lsof -i :3001

# 의존성 재설치
cd server && npm install
```

### 프론트엔드에서 API 호출 실패
- 백엔드 서버가 실행 중인지 확인
- `constants/api.ts`의 `API_BASE_URL` 확인
- 네트워크 연결 확인

### 인증 실패
- Supabase 환경 변수 확인
- Supabase Dashboard에서 Kakao 제공자 활성화 확인

