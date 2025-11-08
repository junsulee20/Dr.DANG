#!/bin/bash

# WSL2에서 ngrok을 사용하여 모바일 테스트
# 이 방법은 WSL2에서 직접 테스트할 수 있게 해줍니다

echo "🚀 WSL2에서 모바일 테스트 시작 (ngrok 사용)"
echo "================================"

# ngrok 설치 확인
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok이 설치되어 있지 않습니다."
    echo "📦 ngrok 설치 중..."
    
    # ngrok 설치 (Linux)
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip -O /tmp/ngrok.zip
        unzip -o /tmp/ngrok.zip -d /tmp/
        sudo mv /tmp/ngrok /usr/local/bin/
        chmod +x /usr/local/bin/ngrok
    else
        echo "❌ 자동 설치가 지원되지 않는 시스템입니다."
        echo "수동 설치: https://ngrok.com/download"
        exit 1
    fi
fi

echo "✅ ngrok 설치 확인 완료"
echo ""

# 프로젝트 디렉토리로 이동
cd /home/sean/next/drdang/Dr.DANG || exit 1

# Expo 서버 시작 (백그라운드)
echo "🚀 Expo 서버 시작 중..."
npm start &
EXPO_PID=$!

echo "✅ Expo 서버 시작됨 (PID: $EXPO_PID)"
echo "⏳ 서버가 시작될 때까지 대기 중..."
sleep 10

# ngrok 터널 생성
echo ""
echo "🌐 ngrok 터널 생성 중..."
echo "================================"

# ngrok 실행 (포트 8081)
ngrok http 8081 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "✅ ngrok 시작됨 (PID: $NGROK_PID)"
echo "⏳ 터널이 생성될 때까지 대기 중..."
sleep 5

# ngrok URL 추출
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok\.io' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ ngrok URL을 가져올 수 없습니다."
    echo "ngrok이 정상적으로 시작되었는지 확인하세요."
    kill $EXPO_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ ngrok 터널 생성 완료!"
echo "================================"
echo "📱 모바일에서 접속할 URL:"
echo "   $NGROK_URL"
echo ""
echo "📋 Expo Go 앱에서:"
echo "   1. Expo Go 앱 열기"
echo "   2. 'Enter URL manually' 선택"
echo "   3. 다음 URL 입력: $NGROK_URL"
echo ""
echo "⏹️  서버를 중지하려면 Ctrl+C를 누르세요"
echo "================================"

# 프로세스 종료 함수
cleanup() {
    echo ""
    echo "🛑 서버 종료 중..."
    kill $EXPO_PID $NGROK_PID 2>/dev/null
    echo "✅ 서버 종료 완료"
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 대기
wait

