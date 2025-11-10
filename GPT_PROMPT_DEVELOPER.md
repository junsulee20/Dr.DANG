# Dr. DANG GPT 프롬프트 개발자 인수인계 문서

**담당 개발자: 지우**

## 📋 프로젝트 개요

**Dr. DANG**은 사진 한 장으로 당뇨 관리를 지원하는 모바일 앱입니다.  
사용자가 음식 사진을 촬영하면 **GPT-4 Vision API**를 통해 혈당 예상 상승치 및 영양 성분을 분석합니다.

---

## 🎯 목표

음식 사진을 입력받아 다음과 같은 정보를 **정확하고 일관된 JSON 형식**으로 반환:

1. 음식명 (한글)
2. 예상 혈당 상승치 (40-70 범위)
3. **당뇨 관련 액션 가이드** (중요!)
4. 영양성분 (탄수화물, 단백질, 지방 - g 단위)
5. 상세 영양 점수 (0-100 점수)
6. 식사 추천사항

---

## 🤖 사용할 API

**OpenAI GPT-4 Vision API**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",  // 또는 최신 Vision 모델
  messages: [...],
  max_tokens: 1000,
});
```

---

## 📝 핵심 프롬프트 설계

### 기본 프롬프트

```
당뇨 관리 앱을 위한 음식 사진 분석 전문가입니다.

다음 음식 사진을 분석하여 **반드시 JSON 형식**으로 응답해주세요.

### 분석 항목:

1. **음식명** (foodName)
   - 한글로 정확한 음식명 작성
   - 예: "고기국수", "김치찌개", "비빔밥"

2. **예상 혈당 상승치** (expectedGlucoseRise)
   - 40-70 사이의 정수값
   - 당뇨 환자의 혈당 상승을 예측한 값
   - 탄수화물 양, 당지수(GI), 조리 방법 등을 종합 고려

3. **당뇨 관련 액션 가이드** (actionGuide) ⭐ 중요!
   - 배열 형식으로 2-5개 항목
   - 당뇨 환자에게 즉시 실행 가능한 구체적인 액션 제공
   - 예시 항목:
     - "섭취순서는 어떻게 하세요" (채소 → 단백질 → 지방 → 탄수화물 순서 등)
     - "몇시간 공복 유지하세요" (식후 몇 시간 동안 식사하지 말 것)
     - "내일은 탄수화물 양을 줄이세요" (다음 식사 조절 안내)
     - "걷기운동하세요" (식후 운동 권장)
     - "어떤 영양제를 섭취하세요" (필요한 영양소 보충)
   - 음식의 영양 성분과 혈당 상승치에 따라 맞춤형으로 제공
   - 구체적이고 실용적인 지시문으로 작성

4. **영양성분** (nutrition)
   - 단위: g (그램)
   - carbs: 탄수화물
   - protein: 단백질
   - fat: 지방
   - 실제 사진에 보이는 양 기준으로 추정

5. **상세 영양 점수** (detailedNutrition)
   - 0-100 사이의 점수
   - calories: 열량 점수 (일반 성인 기준 대비)
   - fat: 지방 점수
   - sodium: 나트륨 점수
   - sugar: 당 점수
   - ratio: 탄단지 비율 점수 (균형 잡힌 비율일수록 높은 점수)

6. **식사 추천사항** (recommendations)
   - 배열 형식으로 2-5개 항목
   - 당뇨 환자를 위한 구체적이고 실용적인 조언
   - 예: ["탄단지 비율이 나빠요", "포화지방이 높아요", "채소를 먼저 드시고 탄수화물은 나중에 드시는 것을 추천합니다"]

### 응답 형식 (JSON만 반환):

{
  "foodName": "고기국수",
  "expectedGlucoseRise": 55,
  "nutrition": {
    "carbs": 102,
    "protein": 30,
    "fat": 20
  },
  "detailedNutrition": {
    "calories": 84,
    "fat": 79,
    "sodium": 81,
    "sugar": 89,
    "ratio": 35
  },
  "recommendations": [
    "탄단지 비율이 나빠요",
    "포화지방이 높아요",
    "당이 약간 높아요"
  ],
  "analysisResult": {
    "canRise": true,
    "warning": "혈당이 40~70mg/dL 이상 상승할 수 있어요!"
  }
}

**중요**: 
- JSON 형식만 반환하세요. 다른 설명 없이 순수 JSON만 반환합니다.
- 모든 숫자는 정수입니다.
- expectedGlucoseRise는 반드시 40-70 사이입니다.
- 점수는 반드시 0-100 사이입니다.
```

---

## 🔄 API 엔드포인트 설계

### 백엔드 개발자에게 제공할 엔드포인트

```
POST /api/food/analyze/gpt
  Request:
    {
      imageUrl: string,  // Supabase Storage URL 또는 Base64
      imageFormat?: "url" | "base64"  // 기본값: "url"
    }
  
  Response:
    {
      foodName: string,
      expectedGlucoseRise: number,
      actionGuide: string[],  // 당뇨 관련 액션 가이드
      nutrition: {
        carbs: number,
        protein: number,
        fat: number
      },
      detailedNutrition: {
        calories: number,
        fat: number,
        sodium: number,
        sugar: number,
        ratio: number
      },
      recommendations: string[],
      analysisResult: {
        canRise: boolean,
        warning: string
      }
    }
  
  Error Response:
    {
      error: {
        code: "GPT_API_ERROR" | "IMAGE_PROCESSING_ERROR" | "INVALID_RESPONSE",
        message: string,
        details?: object
      }
    }
```

---

## 💻 구현 예시 코드

### TypeScript 예시

```typescript
import OpenAI from 'openai';

interface FoodAnalysisRequest {
  imageUrl: string;
  imageFormat?: 'url' | 'base64';
}

interface FoodAnalysisResponse {
  foodName: string;
  expectedGlucoseRise: number; // 40-70
  actionGuide: string[]; // 당뇨 관련 액션 가이드
  nutrition: {
    carbs: number;
    protein: number;
    fat: number;
  };
  detailedNutrition: {
    calories: number;
    fat: number;
    sodium: number;
    sugar: number;
    ratio: number;
  };
  recommendations: string[];
  analysisResult: {
    canRise: boolean;
    warning: string;
  };
}

export async function analyzeFoodImage(
  request: FoodAnalysisRequest
): Promise<FoodAnalysisResponse> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `당뇨 관리 앱을 위한 음식 사진 분석 전문가입니다. 음식 사진을 분석하여 JSON 형식으로만 응답합니다.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `다음 음식 사진을 분석하여 JSON 형식으로 응답해주세요.

중요: 당뇨 관리 앱을 위한 분석이므로, 예상 혈당 상승치와 영양성분 사이에 **당뇨 관련 액션 가이드**를 반드시 포함해야 합니다.

응답 형식:
{
  "foodName": "음식명",
  "expectedGlucoseRise": 40-70 사이 숫자,
  "actionGuide": [
    "섭취순서는 채소 → 단백질 → 지방 → 탄수화물 순서로 드세요",
    "식후 몇시간 공복 유지하세요",
    "내일은 탄수화물 양을 줄이세요",
    "걷기운동하세요",
    "어떤 영양제를 섭취하세요"
  ],
  "nutrition": {
    "carbs": 숫자,
    "protein": 숫자,
    "fat": 숫자
  },
  "detailedNutrition": {
    "calories": 0-100 점수,
    "fat": 0-100 점수,
    "sodium": 0-100 점수,
    "sugar": 0-100 점수,
    "ratio": 0-100 점수
  },
  "recommendations": ["조언1", "조언2", ...],
  "analysisResult": {
    "canRise": boolean,
    "warning": "경고 메시지"
  }
}

actionGuide는 음식의 영양 성분과 혈당 상승치에 따라 맞춤형으로 제공하세요. 구체적이고 실행 가능한 지시문으로 작성하세요.

JSON만 반환하세요. 다른 설명 없이 순수 JSON만 반환합니다.`
            },
            {
              type: "image_url",
              image_url: {
                url: request.imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3, // 일관성 향상
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT');
    }

    // JSON 파싱 (코드 블록 제거)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as FoodAnalysisResponse;

    // 검증
    validateResponse(parsed);

    return parsed;

  } catch (error) {
    console.error('GPT API Error:', error);
    throw new Error(`Food analysis failed: ${error.message}`);
  }
}

function validateResponse(data: any): asserts data is FoodAnalysisResponse {
  // 예상 혈당 상승치 검증
  if (data.expectedGlucoseRise < 40 || data.expectedGlucoseRise > 70) {
    throw new Error('expectedGlucoseRise must be between 40 and 70');
  }

  // 점수 검증 (0-100)
  const scores = [
    data.detailedNutrition.calories,
    data.detailedNutrition.fat,
    data.detailedNutrition.sodium,
    data.detailedNutrition.sugar,
    data.detailedNutrition.ratio
  ];

  for (const score of scores) {
    if (score < 0 || score > 100) {
      throw new Error('Scores must be between 0 and 100');
    }
  }

  // 필수 필드 검증
  if (!data.foodName || !data.nutrition || !data.recommendations) {
    throw new Error('Missing required fields');
  }
}
```

---

## 🎨 프롬프트 개선 포인트

### 1. JSON 응답 일관성 확보
- `response_format: { type: "json_object" }` 사용 (가능한 경우)
- 코딩된 예시와 포맷 명확히 제시
- 온도(temperature) 낮게 설정 (0.2-0.3)

### 2. 한국 음식 인식 정확도 향상
- 프롬프트에 한국 음식 예시 추가
- "한국 음식 전문가" 역할 부여

### 3. 응답 검증 및 재시도 로직
```typescript
async function analyzeWithRetry(request: FoodAnalysisRequest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await analyzeFoodImage(request);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // 지수 백오프
    }
  }
}
```

---

## 📊 테스트 케이스

### 샘플 이미지 및 예상 응답

**1. 고기국수**
```json
{
  "foodName": "고기국수",
  "expectedGlucoseRise": 55,
  "actionGuide": [
    "섭취순서는 채소 → 단백질 → 지방 → 탄수화물 순서로 드세요",
    "식후 2-3시간 공복 유지하세요",
    "내일은 탄수화물 양을 줄이세요",
    "식후 30분 후 20분간 걷기운동하세요",
    "마그네슘과 크롬 영양제를 섭취하세요"
  ],
  "nutrition": {
    "carbs": 102,
    "protein": 30,
    "fat": 20
  },
  "detailedNutrition": {
    "calories": 84,
    "fat": 79,
    "sodium": 81,
    "sugar": 89,
    "ratio": 35
  },
  "recommendations": [
    "탄단지 비율이 나빠요",
    "포화지방이 높아요",
    "당이 약간 높아요"
  ],
  "analysisResult": {
    "canRise": true,
    "warning": "혈당이 40~70mg/dL 이상 상승할 수 있어요!"
  }
}
```

**2. 김밥**
```json
{
  "foodName": "김밥",
  "expectedGlucoseRise": 45,
  "actionGuide": [
    "채소를 먼저 드시고 쌀을 마지막에 드세요",
    "식후 2시간 공복 유지하세요",
    "식후 20분 후 15분간 걷기운동하세요"
  ],
  "nutrition": {
    "carbs": 85,
    "protein": 25,
    "fat": 15
  },
  ...
}
```

**3. 샐러드 (혈당 상승 낮음)**
```json
{
  "foodName": "닭가슴살 샐러드",
  "expectedGlucoseRise": 20,
  "actionGuide": [
    "현재 식사는 혈당에 안전합니다",
    "계속 건강한 식단을 유지하세요",
    "식사량을 늘려도 괜찮습니다"
  ],
  ...
}
```

---

## ⚠️ 주의사항

### 1. 비용 관리
- GPT-4 Vision API는 이미지당 비용 발생
- 이미지 크기 최적화 (리사이징) 권장
- 캐싱 전략 고려 (동일 이미지 재요청 방지)

### 2. 응답 시간
- 평균 응답 시간: 5-10초
- 타임아웃 설정: 30초
- 사용자에게 로딩 상태 제공 필요

### 3. 에러 처리
- 네트워크 오류
- API 키 만료
- Rate limit 초과
- 잘못된 이미지 형식
- GPT 응답 파싱 실패

### 4. 프롬프트 버전 관리
- 프롬프트 변경 시 버전 관리
- A/B 테스트 가능하도록 구조화

---

## 🔄 백엔드 개발자와의 협업

### 제공해야 할 정보
1. **엔드포인트 URL**: `http://your-service/api/food/analyze/gpt`
2. **요청 형식**: 위의 API 스펙 (actionGuide 포함)
3. **응답 형식**: 위의 API 스펙 (actionGuide 포함)
4. **에러 처리 방법**: 에러 코드 및 재시도 정책
5. **타임아웃 설정**: 30초 권장

### 협의 필요 사항
- 이미지 URL vs Base64 인코딩 선택
- 캐싱 정책 (동일 이미지 재분석 방지)
- Rate limiting 전략
- 모니터링 및 로깅 방법
- **actionGuide 필드 검증 방법** (백엔드 개발자 상일과 협의)

---

## 📈 성능 최적화

### 1. 프롬프트 최적화
- 불필요한 설명 제거
- 예시 명확히 제시
- JSON 스키마 명시
- **actionGuide 필드의 중요성 강조** (예상 혈당 상승치와 영양성분 사이에 위치)

### 2. 응답 파싱 개선
- JSON 추출 정규식 최적화
- Fallback 파싱 로직
- 부분 응답 처리

### 3. 캐싱 전략
```typescript
// 동일 이미지 해시로 캐싱
const imageHash = createImageHash(imageUrl);
const cached = await cache.get(imageHash);
if (cached) return cached;
```

---

## 📝 체크리스트

- [ ] GPT-4 Vision API 키 설정
- [ ] 프롬프트 최종 검토 및 테스트
- [ ] 다양한 한국 음식 이미지로 테스트
- [ ] JSON 응답 형식 일관성 검증
- [ ] 에러 처리 구현
- [ ] 타임아웃 및 재시도 로직 구현
- [ ] 비용 모니터링 설정
- [ ] 백엔드 개발자에게 API 스펙 전달

---

## 📞 문의

백엔드 개발자(상일)와 협업하여 API 엔드포인트를 완성하고, 프론트엔드와 통합하세요.

문서: `docs/BACKEND_DEVELOPER.md` 참고

