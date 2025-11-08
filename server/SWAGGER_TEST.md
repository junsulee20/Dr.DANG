# Swagger UI 테스트 가이드

## 1. Swagger UI 접속

### 백엔드 서버 실행 확인
```bash
curl http://localhost:3001/health
```

### Swagger UI 접속
브라우저에서:
```
http://localhost:3001/api-docs
```

## 2. 테스트 사용자 생성 및 JWT 토큰 받기

### 방법 1: Swagger UI에서 직접 테스트

#### 1단계: 테스트 사용자 생성
1. Swagger UI에서 **Test** 섹션 찾기
2. **POST /test/user/create** 엔드포인트 클릭
3. **Try it out** 버튼 클릭
4. **Execute** 버튼 클릭
5. Response에서 **token** 값 복사

#### 2단계: JWT 토큰 인증 설정
1. Swagger UI 상단의 **Authorize** 버튼 클릭 (자물쇠 아이콘)
2. Value 필드에 `Bearer <토큰>` 입력
   - 예: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Authorize** 클릭
4. **Close** 클릭

#### 3단계: API 테스트
이제 인증이 필요한 모든 API를 테스트할 수 있습니다:

### 방법 2: curl 명령어 사용

#### 1단계: 테스트 사용자 생성 및 토큰 받기
```bash
cd /home/sean/next/drdang/Dr.DANG/server

# 테스트 사용자 생성
curl -X POST http://localhost:3001/test/user/create

# 응답 예시:
# {
#   "status": "ok",
#   "data": {
#     "userId": "...",
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }
```

#### 2단계: 토큰을 환경 변수로 저장
```bash
TOKEN="여기에_토큰_붙여넣기"
```

#### 3단계: API 테스트
```bash
# 프로필 조회
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/user/profile

# 프로필 생성
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "diabetesType": "type2",
    "targetCalories": 2000
  }'

# 식단 기록 조회
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/records

# 식단 기록 생성
curl -X POST http://localhost:3001/api/records \
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
      "totalCalories": 350
    },
    "mealType": "lunch"
  }'
```

### 방법 3: 자동 테스트 스크립트 사용

```bash
cd /home/sean/next/drdang/Dr.DANG/server
chmod +x test.sh
./test.sh
```

이 스크립트가 자동으로:
1. 테스트 사용자 생성
2. JWT 토큰 발급
3. 모든 API 테스트
4. 결과 출력

## 3. Swagger UI에서 각 API 테스트

### 프로필 API

#### GET /api/user/profile (조회)
1. **User** 섹션에서 **GET /api/user/profile** 클릭
2. **Try it out** 클릭
3. **Execute** 클릭
4. Response 확인

#### PUT /api/user/profile (수정)
1. **User** 섹션에서 **PUT /api/user/profile** 클릭
2. **Try it out** 클릭
3. Request body 수정:
   ```json
   {
     "age": 30,
     "gender": "male",
     "height": 175,
     "weight": 70,
     "diabetesType": "type2",
     "targetCalories": 2000
   }
   ```
4. **Execute** 클릭
5. Response 확인

### 식단 기록 API

#### GET /api/records (조회)
1. **Records** 섹션에서 **GET /api/records** 클릭
2. **Try it out** 클릭
3. Query parameters 입력 (선택사항)
4. **Execute** 클릭
5. Response 확인

#### POST /api/records (생성)
1. **Records** 섹션에서 **POST /api/records** 클릭
2. **Try it out** 클릭
3. Request body 수정:
   ```json
   {
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
     "mealType": "lunch"
   }
   ```
4. **Execute** 클릭
5. Response 확인

### 음식 분석 API

#### POST /api/food/analyze
1. **Food** 섹션에서 **POST /api/food/analyze** 클릭
2. **Try it out** 클릭
3. 이미지 파일 선택 (Browse 버튼)
4. **Execute** 클릭
5. Response 확인 (이미지 URL과 분석 결과)

## 4. Supabase Table Editor에서 데이터 확인

### 데이터 저장 확인
1. **Supabase Dashboard** 접속
2. **Table Editor** 클릭
3. 테이블 확인:
   - **users**: 테스트 사용자 확인
   - **user_profiles**: 프로필 데이터 확인
   - **food_records**: 식단 기록 확인

## 빠른 시작

```bash
# 1. 백엔드 서버 실행 확인
curl http://localhost:3001/health

# 2. Swagger UI 접속
# 브라우저에서: http://localhost:3001/api-docs

# 3. 테스트 사용자 생성 (Swagger UI 또는 curl)
curl -X POST http://localhost:3001/test/user/create

# 4. 토큰을 받아서 Authorize 버튼에 입력

# 5. API 테스트 시작!
```

## 주의사항

### JWT 토큰 인증
- 모든 API는 JWT 토큰이 필요합니다
- Swagger UI 상단의 **Authorize** 버튼으로 토큰 설정
- 토큰 형식: `Bearer <토큰>`

### 테스트 사용자
- `/test/user/create`는 개발 환경에서만 사용 가능
- 프로덕션에서는 실제 카카오 로그인 사용

### 이미지 업로드
- Supabase Storage의 `food-images` 버킷이 생성되어 있어야 함
- 버킷이 없으면 Supabase Dashboard에서 생성

파일이 올바른 위치에 있으니 이제 Swagger UI에서 테스트할 수 있습니다!

