#!/bin/bash

# Dr.DANG 서버 시작 스크립트

echo "🚀 Dr.DANG 서버 시작 스크립트"
echo "================================"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 기존 프로세스 종료
echo -e "${YELLOW}기존 프로세스 종료 중...${NC}"
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null
pkill -f "node.*dev" 2>/dev/null
sleep 2

# 캐시 삭제
echo -e "${YELLOW}캐시 삭제 중...${NC}"
cd "$(dirname "$0")"
rm -rf .expo node_modules/.cache 2>/dev/null
cd server && rm -rf node_modules/.cache 2>/dev/null
cd ..

# 환경 변수 확인
echo -e "${YELLOW}환경 변수 확인 중...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}오류: .env 파일이 없습니다!${NC}"
    exit 1
fi

if [ ! -f "server/.env" ]; then
    echo -e "${RED}오류: server/.env 파일이 없습니다!${NC}"
    exit 1
fi

# 백엔드 서버 시작
echo -e "${GREEN}백엔드 서버 시작 중...${NC}"
cd server
npm run dev > ../server.log 2>&1 &
BACKEND_PID=$!
cd ..

# 백엔드 서버 시작 대기
echo "백엔드 서버 시작 대기 중..."
sleep 5

# 백엔드 서버 상태 확인
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ 백엔드 서버가 정상적으로 시작되었습니다!${NC}"
else
    echo -e "${RED}❌ 백엔드 서버 시작 실패. server.log를 확인하세요.${NC}"
    exit 1
fi

# 프론트엔드 서버 시작
echo -e "${GREEN}프론트엔드 서버 시작 중...${NC}"
echo -e "${YELLOW}프론트엔드 서버는 별도 터미널에서 수동으로 시작해야 합니다:${NC}"
echo -e "${GREEN}npm start -- --clear${NC}"

echo ""
echo "================================"
echo -e "${GREEN}백엔드 서버 PID: $BACKEND_PID${NC}"
echo -e "${GREEN}백엔드 로그: server.log${NC}"
echo ""
echo "서버를 종료하려면:"
echo "  kill $BACKEND_PID"

