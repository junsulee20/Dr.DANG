# 문제 해결 가이드

## localhost:8081 연결 거부 오류

### 원인
Expo Metro 번들러가 제대로 시작되지 않았거나 포트가 차단되어 있을 수 있습니다.

### 해결 방법

#### 1. Expo 서버 완전히 재시작
```bash
# 모든 Expo 프로세스 종료
pkill -f "expo start"
pkill -f "metro"

# 캐시 삭제
rm -rf .expo node_modules/.cache

# 서버 재시작 (캐시 클리어)
npm start -- --clear
```

#### 2. 포트 확인
```bash
# 포트 8081 사용 중인지 확인
lsof -i :8081

# 사용 중이면 프로세스 종료
kill -9 <PID>
```

#### 3. 다른 포트에서 실행
```bash
# 포트 8082에서 실행
npx expo start --port 8082
```

#### 4. 네트워크 확인
- 방화벽 설정 확인
- WSL2 환경에서는 포트 포워딩 확인 필요

## 환경 변수 관련 오류

### Supabase 설정 오류
1. `.env` 파일이 프론트엔드 루트에 있는지 확인
2. `EXPO_PUBLIC_` 접두사가 있는지 확인
3. Expo 서버를 재시작했는지 확인

### OpenAI API 키 오류
1. 백엔드 `server/.env` 파일에 키가 있는지 확인
2. 백엔드 서버를 재시작했는지 확인

## 백엔드 서버 연결 오류

### localhost:3001 연결 실패
1. 백엔드 서버가 실행 중인지 확인
   ```bash
   curl http://localhost:3001/health
   ```

2. 백엔드 서버 재시작
   ```bash
   cd server
   npm run dev
   ```

3. 포트가 사용 중인지 확인
   ```bash
   lsof -i :3001
   ```

## 일반적인 해결 순서

1. **모든 서버 종료**
   ```bash
   pkill -f "expo"
   pkill -f "metro"
   pkill -f "node.*dev"
   ```

2. **캐시 삭제**
   ```bash
   rm -rf .expo node_modules/.cache
   cd server && rm -rf node_modules/.cache
   ```

3. **백엔드 서버 시작** (터미널 1)
   ```bash
   cd server
   npm run dev
   ```

4. **프론트엔드 서버 시작** (터미널 2)
   ```bash
   npm start -- --clear
   ```

## 브라우저에서 연결 실패

### 웹 브라우저에서 실행 시
```bash
npm start -- --web
```

### 네트워크 설정
- WSL2 환경: Windows 호스트의 IP 주소 사용
- 로컬 네트워크: 같은 네트워크에 연결되어 있는지 확인

## 로그 확인

### Expo 로그
```bash
npm start
# 또는
npx expo start --verbose
```

### 백엔드 로그
백엔드 서버 터미널에서 에러 메시지 확인

### 브라우저 콘솔
브라우저 개발자 도구(F12)에서 콘솔 에러 확인

