# WSL2에서 모바일 테스트 (간단한 방법)

## 🎯 ngrok 사용 (가장 간단)

### 1단계: ngrok 설치
```bash
npm install -g ngrok
```

### 2단계: Expo 서버 시작
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

### 3단계: ngrok 터널 생성 (새 터미널)
```bash
ngrok http 8081
```

### 4단계: 모바일에서 접속
1. ngrok이 제공하는 HTTPS URL 확인 (예: `https://abc123.ngrok.io`)
2. Expo Go 앱에서 "Enter URL manually" 선택
3. ngrok URL 입력
4. 접속 완료!

## 🚀 자동 스크립트 사용

```bash
cd /home/sean/next/drdang/Dr.DANG
./start-with-ngrok.sh
```

이 스크립트가 자동으로:
1. Expo 서버 시작
2. ngrok 터널 생성
3. 접속 URL 표시

## 📱 모바일 접속 방법

### 방법 1: URL 직접 입력
1. Expo Go 앱 열기
2. "Enter URL manually" 선택
3. ngrok URL 입력: `https://abc123.ngrok.io`

### 방법 2: QR 코드 (ngrok URL 포함)
- ngrok을 사용하면 QR 코드도 ngrok URL로 생성됨
- QR 코드 스캔 가능

## ⚠️ 주의사항

### ngrok 무료 제한
- 세션당 2시간
- 2시간 후 재연결 필요
- 해결: `ngrok http 8081` 다시 실행

### ngrok URL 변경
- 무료 계정은 매번 URL이 변경됨
- 재시작할 때마다 새로운 URL 생성
- 해결: ngrok 유료 계정으로 도메인 고정

## 🔧 문제 해결

### ngrok 설치 실패
```bash
# npm이 안 되면 직접 다운로드
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip
unzip ngrok-v3-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin/
```

### ngrok 연결 실패
- 인터넷 연결 확인
- 방화벽 설정 확인
- ngrok 서버 상태 확인

### Expo 서버 시작 실패
```bash
# 포트 확인
lsof -i :8081

# 프로세스 종료
kill -9 $(lsof -ti:8081)
```

## 💡 팁

### ngrok authtoken 설정 (선택사항)
```bash
# ngrok 계정 생성: https://ngrok.com/
# authtoken 받기: https://dashboard.ngrok.com/get-started/your-authtoken

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

authtoken을 설정하면:
- 더 긴 세션 시간
- 더 많은 기능 사용 가능

### 백엔드 서버도 ngrok으로 노출
```bash
# 터미널 1: 백엔드 서버
cd server
npm run dev

# 터미널 2: 백엔드 ngrok 터널
ngrok http 3001

# 프론트엔드 API URL을 ngrok URL로 변경
```

## 🎉 완료!

이제 WSL2에서 직접 모바일 테스트가 가능합니다!

1. ✅ ngrok 설치
2. ✅ Expo 서버 실행
3. ✅ ngrok 터널 생성
4. ✅ 모바일에서 ngrok URL 사용

더 이상 Windows IP가 필요 없습니다!

