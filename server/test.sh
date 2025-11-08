#!/bin/bash

# Dr.DANG API 테스트 스크립트

echo "🧪 Dr.DANG API 테스트 시작..."
echo ""

# 1. 서버 헬스 체크
echo "1️⃣ 서버 헬스 체크..."
curl -s http://localhost:3001/health | jq .
echo -e "\n"

# 2. Supabase 연결 테스트
echo "2️⃣ Supabase 연결 테스트..."
curl -s http://localhost:3001/test/supabase | jq .
echo -e "\n"

# 3. 테스트 사용자 생성
echo "3️⃣ 테스트 사용자 생성 및 토큰 발급..."
RESPONSE=$(curl -s -X POST http://localhost:3001/test/user/create)
echo $RESPONSE | jq .

TOKEN=$(echo $RESPONSE | jq -r '.data.token')
USER_ID=$(echo $RESPONSE | jq -r '.data.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 토큰 발급 실패!"
  exit 1
fi

echo "✅ 토큰 발급 성공: ${TOKEN:0:20}..."
echo "✅ 사용자 ID: $USER_ID"
echo -e "\n"

# 4. 프로필 생성
echo "4️⃣ 프로필 생성..."
curl -s -X PUT http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "diabetesType": "type2",
    "targetCalories": 2000
  }' | jq .
echo -e "\n"

# 5. 프로필 조회
echo "5️⃣ 프로필 조회..."
curl -s http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# 6. 식단 기록 생성
echo "6️⃣ 식단 기록 생성..."
curl -s -X POST http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "analyzedData": {
      "foods": [{
        "name": "김치찌개",
        "quantity": "1인분",
        "calories": 350,
        "carbs": 40,
        "protein": 15,
        "fat": 12
      }],
      "totalCalories": 350,
      "totalCarbs": 40,
      "totalProtein": 15,
      "totalFat": 12
    },
    "mealType": "lunch"
  }' | jq .
echo -e "\n"

# 7. 식단 기록 조회
echo "7️⃣ 식단 기록 조회..."
curl -s http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# 8. 데이터베이스 조회 테스트
echo "8️⃣ 데이터베이스 조회 테스트..."
echo "   - users 테이블:"
curl -s "http://localhost:3001/test/db/query?table=users&limit=3" | jq '.data.records'
echo ""
echo "   - food_records 테이블:"
curl -s "http://localhost:3001/test/db/query?table=food_records&limit=3" | jq '.data.records'
echo ""

echo "✅ 모든 테스트 완료!"
echo ""
echo "💡 Supabase Dashboard에서 데이터를 확인하세요:"
echo "   https://supabase.com/dashboard/project/[your-project]/editor"

