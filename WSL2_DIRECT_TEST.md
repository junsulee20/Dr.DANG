# WSL2에서 직접 모바일 테스트하기

## 방법 1: ngrok 사용 (가장 간단하고 확실함) ⭐

### ngrok 설치
```bash
# 방법 1: npm으로 설치
npm install -g ngrok

# 방법 2: 직접 다운로드
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip
unzip ngrok-v3-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin/
```

### ngrok 사용 방법

#### 방법 A: 자동 스크립트 사용
```bash
cd /home/sean/next/drdang/Dr.DANG
./start-with-ngrok.sh
```

#### 방법 B: 수동으로 실행
```bash
# 터미널 1: Expo 서버
cd /home/sean/next/drdang/Dr.DANG
npm start

# 터미널 2: ngrok 터널
ngrok http 8081
```

### ngrok URL 사용
1. ngrok이 제공하는 HTTPS URL 확인 (예: `https://abc123.ngrok.io`)
2. Expo Go 앱에서 "Enter URL manually" 선택
3. ngrok URL 입력
4. 접속 완료!

### ngrok 장점
- ✅ WSL2에서 직접 사용 가능
- ✅ 외부 네트워크에서도 접속 가능
- ✅ HTTPS 지원
- ✅ 설정이 간단함

### ngrok 무료 제한
- 무료 계정: 세션당 2시간, 재연결 필요
- 해결: ngrok 계정 생성 후 authtoken 설정

## 방법 2: WSL2 네트워크 설정 변경

### WSL2 IP를 외부에 노출
```bash
# WSL2에서 실행
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
npm start
```

### Windows 방화벽 설정
1. Windows 설정 > 방화벽
2. 고급 설정 > 인바운드 규칙
3. 새 규칙 > 포트
4. 포트 8081 허용

### 문제점
- WSL2 IP는 동적이므로 매번 변경될 수 있음
- 네트워크 설정이 복잡할 수 있음

## 방법 3: WSL2에서 실제 Windows IP 사용

### Windows IP 확인
```bash
# WSL2에서 실행
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
```

### Expo 서버를 Windows IP로 바인딩
```bash
# Windows IP를 환경 변수로 설정
export WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
export EXPO_DEVTOOLS_LISTEN_ADDRESS=$WINDOWS_IP

npm start
```

### 문제점
- Windows 방화벽 설정 필요
- 네트워크 구성에 따라 작동하지 않을 수 있음

## 방법 4: 로컬호스트 터널 (로컬 테스트)

### localtunnel 사용
```bash
# localtunnel 설치
npm install -g localtunnel

# Expo 서버 실행
npm start

# 다른 터미널에서
lt --port 8081
```

### serveo 사용
```bash
# SSH 터널 생성
ssh -R 80:localhost:8081 serveo.net
```

## 🎯 권장 방법: ngrok 사용

### 빠른 시작
```bash
# 1. ngrok 설치 (한 번만)
npm install -g ngrok

# 2. Expo 서버 실행
cd /home/sean/next/drdang/Dr.DANG
npm start

# 3. 다른 터미널에서 ngrok 실행
ngrok http 8081

# 4. ngrok URL을 모바일에서 사용
```

### ngrok authtoken 설정 (선택사항)
```bash
# ngrok 계정 생성: https://ngrok.com/
# authtoken 받기: https://dashboard.ngrok.com/get-started/your-authtoken

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## 🔧 문제 해결

### 문제: ngrok이 설치되지 않음
```bash
# npm으로 설치
npm install -g ngrok

# 또는 직접 다운로드
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip
unzip ngrok-v3-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin/
```

### 문제: ngrok 연결 실패
- 인터넷 연결 확인
- ngrok 서버 상태 확인
- 방화벽 설정 확인

### 문제: Expo 서버가 시작되지 않음
```bash
# 포트 확인
lsof -i :8081

# 프로세스 종료
kill -9 $(lsof -ti:8081)
```

## 📱 모바일에서 접속

### Expo Go 앱 사용
1. Expo Go 앱 설치
2. "Enter URL manually" 선택
3. ngrok URL 입력 (예: `https://abc123.ngrok.io`)
4. 접속 완료!

### QR 코드 사용 (ngrok URL 포함)
- ngrok을 사용하면 QR 코드도 ngrok URL로 생성됨
- QR 코드 스캔 가능

## 💡 팁

### ngrok URL 고정 (유료 기능)
- ngrok 유료 계정으로 도메인 고정 가능
- 무료 계정은 매번 URL이 변경됨

### 자동 재연결
```bash
# ngrok이 종료되면 자동으로 재연결하는 스크립트
while true; do
    ngrok http 8081
    sleep 5
done
```

### 로그 확인
```bash
# ngrok 로그 확인
ngrok http 8081 --log=stdout
```

## 결론

**WSL2에서 직접 테스트하려면 ngrok을 사용하는 것이 가장 간단하고 확실합니다!**

1. ✅ ngrok 설치
2. ✅ Expo 서버 실행
3. ✅ ngrok 터널 생성
4. ✅ 모바일에서 ngrok URL 사용

이 방법으로 WSL2에서 직접 모바일 테스트가 가능합니다!

