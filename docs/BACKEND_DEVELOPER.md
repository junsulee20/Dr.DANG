# Dr. DANG 백엔드 개발자 인수인계 문서

**담당 개발자: 상일**

## 📋 프로젝트 개요

**Dr. DANG**은 사진 한 장으로 당뇨 관리를 지원하는 모바일 앱입니다.  
사용자가 음식 사진을 촬영하면 GPT API를 통해 혈당 예상 상승치 및 영양 성분을 분석합니다.

---

## 🛠 기술 스택

- **Backend Framework**: Supabase (PostgreSQL + Auth + Storage)
- **AI API**: OpenAI GPT-4 Vision API (프롬프트 개발자와 협의 필요)
- **Frontend**: React Native (Expo Router)
- **Language**: TypeScript

---

## 📱 주요 기능 및 API 요구사항

### 1. 사용자 인증

**카카오 로그인 연동**

**필요한 API:**
```
POST /auth/kakao
  Request:
    {
      kakaoAccessToken: string
    }
  
  Response:
    {
      accessToken: string,      // Supabase JWT
      refreshToken: string,
      user: {
        id: string,
        name: string,
        email: string
      }
    }
```

**구현 가이드:**
1. 카카오 Access Token 검증 (Kakao API 호출)
2. 카카오 사용자 정보 조회
3. Supabase Auth에 사용자 생성/조회
4. JWT 토큰 반환

---

### 2. 음식 사진 분석 (핵심 기능)

**플로우:**
1. 사용자가 음식 사진 업로드
2. 이미지를 Supabase Storage에 업로드
3. GPT API 서비스 호출 (`/api/food/analyze/gpt` - 프롬프트 개발자와 협의)
4. 분석 결과를 DB에 저장하고 반환

**필요한 API:**

```
POST /api/food/analyze
  Request:
    - image: File (Multipart)
    - userId: string (JWT에서 추출 가능)
  
  Response:
    {
      foodName: string,           // "고기국수"
      expectedGlucoseRise: number, // 40-70
      actionGuide: string[],      // 당뇨 관련 액션 가이드 (GPT 프롬프트 개발자 지우와 협의)
      nutrition: {
        carbs: number,    // 102 (g)
        protein: number, // 30 (g)
        fat: number      // 20 (g)
      },
      detailedNutrition: {
        calories: number, // 점수 (0-100)
        fat: number,
        sodium: number,
        sugar: number,
        ratio: number     // 탄단지 비율 점수
      },
      recommendations: string[], // ["탄단지 비율이 나빠요", ...]
      analysisResult: {
        canRise: boolean,  // 혈당 상승 가능 여부
        warning: string    // "혈당이 40~70mg/dL 이상 상승할 수 있어요!"
      },
      imageUrl: string      // Supabase Storage URL
    }
```

**구현 단계:**
1. 이미지 파일 검증 (크기, 형식)
2. Supabase Storage에 업로드 → URL 획득
3. GPT API 서비스 호출 (프롬프트 개발자와 협의한 엔드포인트)
4. 응답 파싱 및 검증
5. DB에 저장 (선택사항: 캐싱)
6. 결과 반환

**에러 처리:**
- 이미지 업로드 실패: 500 에러
- GPT API 실패: 503 에러 (재시도 가능)
- 이미지 형식 오류: 400 에러
- 파일 크기 초과: 413 에러

---

### 3. 식단 기록 관리

**필요한 API:**

```
GET /api/records?date={YYYY-MM-DD}
  Headers: Authorization: Bearer {token}
  
  Response:
    {
      date: "2025-11-02",
      meals: [
        {
          id: string,
          mealType: "breakfast" | "lunch" | "dinner",
          foodName: string,
          imageUrl: string,
          nutrition: object,
          createdAt: string
        }
      ]
    }

POST /api/records
  Headers: Authorization: Bearer {token}
  Request:
    {
      date: string,        // "2025-11-02"
      mealType: string,    // "breakfast" | "lunch" | "dinner"
      foodName: string,
      imageUrl: string,
      analysisResult: object // /api/food/analyze의 응답 전체
    }
  
  Response:
    {
      id: string,
      message: "Record created successfully"
    }

GET /api/records/calendar?month={YYYY-MM}
  Headers: Authorization: Bearer {token}
  
  Response:
    {
      dates: ["2025-11-02", "2025-11-06", "2025-11-21"]
    }
```

---

### 4. 사용자 프로필

**필요한 API:**

```
GET /api/user/profile
  Headers: Authorization: Bearer {token}
  
  Response:
    {
      id: string,
      name: string,
      email: string,
      height: number,  // cm
      weight: number,  // kg
      profileImageUrl: string,
      createdAt: string,
      updatedAt: string
    }

PUT /api/user/profile
  Headers: Authorization: Bearer {token}
  Request:
    {
      name?: string,
      height?: number,
      weight?: number,
      profileImage?: File (Multipart)
    }
  
  Response:
    {
      message: "Profile updated successfully",
      user: object
    }
```

---

## 🗄 데이터베이스 스키마 (Supabase)

### users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  height INTEGER,  -- cm
  weight INTEGER,  -- kg
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### meal_records 테이블
```sql
CREATE TABLE meal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  food_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- 분석 결과 (GPT API 응답 저장)
  expected_glucose_rise INTEGER,
  nutrition JSONB,  -- { carbs, protein, fat }
  detailed_nutrition JSONB,  -- { calories, fat, sodium, sugar, ratio }
  recommendations TEXT[],
  analysis_result JSONB,  -- 전체 응답 백업
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date, meal_type)
);

CREATE INDEX idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX idx_meal_records_user_month ON meal_records(user_id, DATE_TRUNC('month', date));
```

---

## 🔧 Supabase 설정

### 1. Storage Bucket 생성

**Bucket 이름**: `food-images`

**설정:**
- Public: `false` (Signed URL 사용 권장)
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Storage Policy:**
```sql
-- 사용자는 자신의 이미지만 업로드 가능
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'food-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 사용자는 자신의 이미지만 조회 가능
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'food-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2. Row Level Security (RLS) 정책

```sql
-- users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- meal_records 테이블
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON meal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON meal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON meal_records FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🔐 인증 및 보안

### JWT 토큰 처리
- 모든 API는 `Authorization: Bearer {token}` 헤더 필요
- Supabase JWT 검증
- 토큰 만료 시 401 에러 반환

### 에러 응답 형식
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지",
    "details": {}
  }
}
```

**주요 에러 코드:**
- `UNAUTHORIZED`: 401 - 토큰 없음/만료
- `FORBIDDEN`: 403 - 권한 없음
- `NOT_FOUND`: 404 - 리소스 없음
- `VALIDATION_ERROR`: 400 - 요청 데이터 오류
- `INTERNAL_ERROR`: 500 - 서버 오류
- `SERVICE_UNAVAILABLE`: 503 - GPT API 등 외부 서비스 오류

---

## 📊 현재 프론트엔드 구현 상태

### ✅ 완료된 화면
- 로그인 화면 (`/login`) - 카카오 로그인 버튼 UI만 구현
- 푸드샷 화면 (`/(tabs)/foodshot`) - 이미지 선택만 구현
- 검사 중 화면 (`/loading`) - 진행률 표시만 구현
- 결과 화면 (`/result`) - 하드코딩된 샘플 데이터 표시
- 기록 화면 (`/(tabs)/record`) - 하드코딩된 샘플 데이터 표시
- 마이페이지 화면 (`/(tabs)/mypage`) - 하드코딩된 프로필 표시

### ⚠️ 필요한 작업
1. **모든 하드코딩된 데이터를 API 호출로 교체**
2. **에러 핸들링 및 로딩 상태 관리**
3. **이미지 업로드 기능 연결**

---

## 🚀 개발 우선순위

1. **Phase 1**: 기본 인증 (카카오 로그인)
2. **Phase 2**: 음식 분석 API (`/api/food/analyze`)
   - 이미지 업로드 (Supabase Storage)
   - GPT API 서비스 연동
3. **Phase 3**: 식단 기록 API (CRUD)
4. **Phase 4**: 사용자 프로필 API
5. **Phase 5**: 통계 및 대시보드 API (선택사항)

---

## 📝 참고사항

### 성능 최적화
- 이미지 크기 최적화: 업로드 전 리사이징 권장
- GPT API 응답 캐싱: 동일 이미지 재요청 방지
- 데이터베이스 인덱싱: 날짜, 사용자별 조회 최적화

### 모니터링
- API 응답 시간 로깅
- GPT API 호출 횟수 및 비용 추적
- 에러 발생률 모니터링

### 환경 변수
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
KAKAO_CLIENT_ID=your_kakao_client_id
GPT_API_SERVICE_URL=http://gpt-service/api/food/analyze/gpt
```

---

## 📞 협업 포인트

**GPT 프롬프트 개발자(지우)와 협의 필요:**
- GPT API 엔드포인트 URL
- 요청/응답 형식
- 에러 처리 방법
- 타임아웃 설정

문서: `docs/GPT_PROMPT_DEVELOPER.md` 참고

---

## 📞 문의

프론트엔드 개발자에게 추가 요구사항이나 질문이 있으면 언제든 연락주세요.

