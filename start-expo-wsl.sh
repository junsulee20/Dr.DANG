#!/bin/bash

# WSL2에서 Expo 서버 시작 (Windows IP 사용)

echo "🚀 Expo 서버 시작 (WSL2 - Windows IP 사용)"
echo "================================"

# Windows IP 확인
WINDOWS_IP=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}')

if [ -z "$WINDOWS_IP" ]; then
    echo "❌ Windows IP를 찾을 수 없습니다."
    echo "대안: Windows PowerShell에서 직접 실행하세요."
    exit 1
fi

echo "✅ Windows IP: $WINDOWS_IP"
echo ""

# 프로젝트 디렉토리로 이동
cd /home/sean/next/drdang/Dr.DANG || exit 1

# 환경 변수 설정 (모든 인터페이스에 바인딩)
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

echo "📱 모바일에서 접속할 URL:"
echo "   exp://$WINDOWS_IP:8081"
echo ""
echo "⚠️  참고: Windows 방화벽에서 포트 8081을 허용해야 할 수 있습니다."
echo "⚠️  문제가 있으면 Windows PowerShell에서 실행하는 것을 권장합니다."
echo ""
echo "🚀 Expo 서버 시작 중..."
echo "================================"

# Expo 서버 시작
npm start

