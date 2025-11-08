# 로컬 테스트 가이드

## 🚀 빠른 시작

### 1. 서버 실행
```bash
cd server
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 📋 테스트 엔드포인트

### 1. 기본 헬스 체크
```bash
curl http://localhost:3001/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Dr.DANG Backend API is running"
}
```

### 2. 테스트 헬스 체크
```bash
curl http://localhost:3001/test/health
```

### 3. Supabase 연결 테스트
```bash
curl http://localhost:3001/test/supabase
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Supabase 연결 성공",
  "data": {
    "connection": "success",
    "timestamp": "2025-11-08T..."
  }
}
```

### 4. 테스트 사용자 생성 및 토큰 발급
```bash
curl -X POST http://localhost:3001/test/user/create
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "테스트 사용자 생성 성공",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test_1234567890@test.com",
      "nickname": "테스트 사용자"
    },
    "token": "jwt-token-here",
    "note": "이 토큰을 Authorization 헤더에 Bearer {token} 형식으로 사용하세요"
  }
}
```

**토큰 저장:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/test/user/create | jq -r '.data.token')
echo $TOKEN
```

### 5. 데이터베이스에 테스트 데이터 삽입
```bash
# 토큰이 있으면
curl -X POST http://localhost:3001/test/db/insert \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'

# 또는 자동으로 테스트 사용자 생성
curl -X POST http://localhost:3001/test/db/insert
```

### 6. 데이터베이스 조회 테스트
```bash
# users 테이블 조회
curl http://localhost:3001/test/db/query?table=users

# user_profiles 테이블 조회
curl http://localhost:3001/test/db/query?table=user_profiles

# food_records 테이블 조회
curl http://localhost:3001/test/db/query?table=food_records

# 개수 제한
curl http://localhost:3001/test/db/query?table=users&limit=10
```

## 🔐 인증이 필요한 API 테스트

### 1. 프로필 조회
```bash
# 먼저 토큰 발급
TOKEN=$(curl -s -X POST http://localhost:3001/test/user/create | jq -r '.data.token')

# 프로필 조회
curl http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 2. 프로필 생성/수정
```bash
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "diabetesType": "type2",
    "targetCalories": 2000
  }'
```

### 3. 식단 기록 조회
```bash
curl http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN"

# 날짜 필터
curl "http://localhost:3001/api/records?date=2025-11-08" \
  -H "Authorization: Bearer $TOKEN"

# 식사 유형 필터
curl "http://localhost:3001/api/records?mealType=lunch" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. 식단 기록 생성
```bash
curl -X POST http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "analyzedData": {
      "foods": [
        {
          "name": "김치찌개",
          "quantity": "1인분",
          "calories": 350,
          "carbs": 40,
          "protein": 15,
          "fat": 12
        }
      ],
      "totalCalories": 350,
      "totalCarbs": 40,
      "totalProtein": 15,
      "totalFat": 12
    },
    "mealType": "dinner",
    "recordedAt": "2025-11-08T12:00:00Z"
  }'
```

## 🌐 Swagger UI 사용

브라우저에서 접속:
```
http://localhost:3001/api-docs
```

Swagger UI에서:
1. 모든 API 엔드포인트 확인
2. "Try it out" 버튼으로 직접 테스트
3. 인증 토큰은 "Authorize" 버튼에서 설정

## 📊 Supabase Dashboard에서 확인

1. Supabase Dashboard 접속
2. **Table Editor** 메뉴
3. 다음 테이블 확인:
   - `users` - 생성된 사용자 확인
   - `user_profiles` - 프로필 데이터 확인
   - `food_records` - 식단 기록 확인

## 🧪 전체 테스트 시나리오

```bash
#!/bin/bash

# 1. 서버 헬스 체크
echo "1. 서버 헬스 체크..."
curl http://localhost:3001/health
echo -e "\n"

# 2. Supabase 연결 테스트
echo "2. Supabase 연결 테스트..."
curl http://localhost:3001/test/supabase
echo -e "\n"

# 3. 테스트 사용자 생성
echo "3. 테스트 사용자 생성..."
RESPONSE=$(curl -s -X POST http://localhost:3001/test/user/create)
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
USER_ID=$(echo $RESPONSE | jq -r '.data.user.id')
echo "토큰: $TOKEN"
echo "사용자 ID: $USER_ID"
echo -e "\n"

# 4. 프로필 생성
echo "4. 프로필 생성..."
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "height": 175.5,
    "weight": 70.0,
    "diabetesType": "type2",
    "targetCalories": 2000
  }'
echo -e "\n"

# 5. 프로필 조회
echo "5. 프로필 조회..."
curl http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# 6. 식단 기록 생성
echo "6. 식단 기록 생성..."
curl -X POST http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "analyzedData": {
      "foods": [{
        "name": "테스트 음식",
        "quantity": "1인분",
        "calories": 500,
        "carbs": 60,
        "protein": 20,
        "fat": 15
      }],
      "totalCalories": 500,
      "totalCarbs": 60,
      "totalProtein": 20,
      "totalFat": 15
    },
    "mealType": "lunch"
  }'
echo -e "\n"

# 7. 식단 기록 조회
echo "7. 식단 기록 조회..."
curl http://localhost:3001/api/records \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "테스트 완료!"
```

이 스크립트를 `test.sh`로 저장하고 실행:
```bash
chmod +x test.sh
./test.sh
```

## ⚠️ 문제 해결

### Supabase 연결 실패
- `.env` 파일의 `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 테이블이 없다는 오류
- Supabase Dashboard에서 마이그레이션 실행 확인
- `server/supabase/migrations/001_initial_schema_simple.sql` 실행했는지 확인

### 인증 오류
- JWT 토큰이 올바른지 확인
- `JWT_SECRET` 환경 변수가 설정되어 있는지 확인
- 토큰이 만료되지 않았는지 확인 (7일 유효)

