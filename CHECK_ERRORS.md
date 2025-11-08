# 에러 확인 가이드

## 현재 상황

터미널 로그를 보면:
- Expo 서버는 시작되고 있음
- dotenv가 환경 변수를 0개 주입 (이건 문제일 수 있음)
- 하지만 `app.config.js`에 기본값이 설정되어 있어서 작동해야 함

## 확인해야 할 사항

### 1. 백엔드 서버가 실행 중인지 확인
```bash
curl http://localhost:3001/health
```

### 2. 프론트엔드에서 실제 에러 확인
브라우저 콘솔이나 터미널에서 실제 에러 메시지를 확인하세요.

### 3. 환경 변수 확인
```bash
# .env 파일 확인
cat .env

# 환경 변수가 로드되는지 확인
node -e "require('dotenv').config(); console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)"
```

## 해결 방법

### 방법 1: app.config.js 기본값 사용 (현재 설정됨)
`app.config.js`에 기본값이 설정되어 있으므로, `.env` 파일이 없어도 작동해야 합니다.

### 방법 2: .env 파일 재생성
```bash
cd /home/sean/next/drdang/Dr.DANG
cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnRtdml5Y3VjZHZ1cGljY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDk3OTIsImV4cCI6MjA3NzcyNTc5Mn0.Ui1FeI3nAZ4mDuUPcFWjUpqMfShk-w1Vd4JbDQQUqjI
EXPO_PUBLIC_API_URL=http://localhost:3001
EOF
```

### 방법 3: 서버 재시작
```bash
# 모든 프로세스 종료
pkill -f "expo"
pkill -f "node.*dev"

# 캐시 삭제
rm -rf .expo node_modules/.cache

# 서버 재시작
npm start -- --clear
```

## 실제 에러 메시지 필요

어떤 에러 메시지가 나오는지 알려주시면 더 정확한 해결책을 제시할 수 있습니다.

