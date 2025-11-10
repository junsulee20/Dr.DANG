import { openai } from '../config/openai';
import { FoodAnalysisResult } from '../types';

interface Step1Response {
  foodName: string;
  estimatedWeight: string;
  nutrients: {
    totalCalories: string;
    carbohydrates: string;
    sugars: string;
    protein: string;
    fat: string;
    sodium: string;
  };
}

interface Step2Response {
  bloodSugarImpact: {
    score: number;
    description: string;
    warning_icon: 'red' | 'yellow' | 'green';
  };
  tips: Array<{
    type: string;
    content: string;
  }>;
}

/**
 * Step 1: 음식 이미지 분석
 */
async function analyzeFoodImage(imageBase64: string): Promise<Step1Response> {
  const systemMessage = `당신은 매우 정밀한 식품 분석기입니다.

당신의 유일한 임무는 사용자가 업로드한 음식 이미지를 분석하여, 다음 3가지 정보를 계산하고 '엄격한 JSON 형식'으로만 반환하는 것입니다.

1. 음식의 정확한 이름
2. 사진 속 1인분의 추정 중량 (예: '150g')
3. '추정된 중량'을 기준으로 계산된 영양 성분

절대로 JSON 객체 외의 설명, 인사, 서문(예: "알겠습니다")을 덧붙여서는 안 됩니다.

[반환할 JSON 스키마]

{
  "foodName": "이미지 속 음식의 구체적인 이름",
  "estimatedWeight": "사진을 기반으로 추정한 1인분 중량 (예: '150g', '200g')",
  "nutrients": {
    "totalCalories": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '195kcal')",
    "carbohydrates": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '45g')",
    "sugars": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '13g')",
    "protein": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '3g')",
    "fat": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '0.3g')",
    "sodium": "'estimatedWeight' 기준 값과 단위를 합친 문자열 (예: '60mg')"
  }
}`;

  const userMessage = `이 음식 사진을 분석하고, 당신의 System Message에 정의된 '엄격한 JSON 형식'으로만 응답해주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('API 응답이 비어있습니다.');
  }

  const parsed = JSON.parse(content) as Step1Response;

  if (!parsed.foodName || !parsed.estimatedWeight || !parsed.nutrients) {
    throw new Error('필수 필드가 누락되었습니다.');
  }

  return parsed;
}

/**
 * Step 2: 당뇨 환자를 위한 조언 생성
 */
async function generateAdvice(step1Result: Step1Response): Promise<Step2Response> {
  const systemMessage = `당신은 'Dr.DANG' 소속의 전문 영양학자이자 당뇨 관리 코치입니다.

당신의 임무는 사용자가 제공한 '음식 분석 데이터'를 바탕으로, 당뇨 환자를 위한 '조언' 부분을 생성하는 것입니다.

[지침]
1. 제공된 수치를 바탕으로 혈당 영향 '점수(score)'를 매기세요.
2. 수치를 '반복'하지 말고, 그 수치가 '어떤 의미'인지 '해석'하여 'description'을 작성하세요.
3. 'tips'는 매번 다양하고 창의적으로, 전문적인 원리를 쉽게 설명해야 합니다.

절대로 JSON 객체 외의 설명, 인사, 서문(예: "알겠습니다")을 덧붙여서는 안 됩니다.

[반환할 JSON 스키마]

{
  "bloodSugarImpact": {
    "score": "제공된 데이터를 바탕으로 계산한 1-100점 사이의 혈당 영향 점수",
    "description": "이 점수와 영양소가 당뇨 환자에게 어떤 의미인지 전문적으로 해석한 글.",
    "warning_icon": "score에 따른 신호등 색상. [기준: score >= 60 이면 'red', 30 <= score < 60 이면 'yellow', score < 30 이면 'green']"
  },
  "tips": [
    {
      "type": "양 조절",
      "content": "전문적인 조언. (가이드: '절반으로 줄이세요' 같은 **단순하고 반복적인 조언을 피하세요.** 대신, 이 음식의 총 탄수화물을 기준으로 '다른 끼니의 탄수화물과 어떻게 교환'할 수 있는지, 또는 '총 섭취 탄수화물 목표(예: 20g)에 맞추려면' 어떻게 해야 하는지 등 **실천적인 방법론**을 제안하세요.)"
    },
    {
      "type": "보완 음식",
      "content": "전문적인 조언. (가이드: **'닭가슴살', '견과류', '채소', '계란' 같은 매우 일반적이고 뻔한 음식 예시를 드는 것을 엄격히 금지합니다.** 대신, 이 음식의 혈당 반응을 늦출 수 있는 **'구체적이고 덜 흔한' 식재료나 식품군**을 '왜' 좋은지(예: 지방/단백질의 소화 지연, 발효 식품의 이점 등) **원리**와 함께 제안하세요.)"
    },
    {
      "type": "식사 순서",
      "content": "전문적인 조언. (가이드: '채소/단백질 먼저 드세요'라는 **단순한 순서 나열을 피하세요.** 대신 '왜' 그 순서가 중요한지 **구체적인 '생리학적 원리'**를 한 가지 설명하세요. (예: 위 배출 속도 지연, 특정 호르몬 자극, 산(acid)의 영향 등) **매번 다른 원리**를 설명하도록 노력하세요.)"
    }
  ]
}`;

  const userMessage = `다음은 내가 먹을 음식의 '분석 데이터'입니다:

${JSON.stringify(step1Result, null, 2)}

이 데이터를 바탕으로, 당신의 System Message에 정의된 '조언 JSON'을 생성해주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('API 응답이 비어있습니다.');
  }

  const parsed = JSON.parse(content) as Step2Response;

  if (!parsed.bloodSugarImpact || !parsed.tips || !Array.isArray(parsed.tips)) {
    throw new Error('필수 필드가 누락되었습니다.');
  }

  return parsed;
}

/**
 * 숫자 추출 유틸리티
 */
function extractNumber(str: string): number {
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * 통합 음식 분석 함수
 */
export async function analyzeFood(imageBase64: string, imageUrl: string): Promise<FoodAnalysisResult> {
  try {
    // Step 1: 음식 이미지 분석
    const step1Result = await analyzeFoodImage(imageBase64);

    // Step 2: 조언 생성
    const step2Result = await generateAdvice(step1Result);

    // 결과 조합
    const carbs = extractNumber(step1Result.nutrients.carbohydrates);
    const protein = extractNumber(step1Result.nutrients.protein);
    const fat = extractNumber(step1Result.nutrients.fat);
    const sugar = extractNumber(step1Result.nutrients.sugars);
    const sodium = extractNumber(step1Result.nutrients.sodium);
    const calories = extractNumber(step1Result.nutrients.totalCalories);

    // 혈당 상승치 계산 (탄수화물 기반 간단한 추정)
    const expectedGlucoseRise = Math.round(carbs * 1.5);

    const result: FoodAnalysisResult = {
      foodName: step1Result.foodName,
      expectedGlucoseRise,
      actionGuide: step2Result.tips.map((tip) => tip.content),
      nutrition: {
        carbs,
        protein,
        fat,
      },
      detailedNutrition: {
        calories,
        fat,
        sodium,
        sugar,
        ratio: step2Result.bloodSugarImpact.score,
      },
      recommendations: step2Result.tips.map((tip) => `${tip.type}: ${tip.content}`),
      analysisResult: {
        canRise: step2Result.bloodSugarImpact.score >= 30,
        warning: step2Result.bloodSugarImpact.description,
      },
      imageUrl,
    };

    return result;
  } catch (error: any) {
    console.error('Food analysis error:', error);
    throw new Error(`음식 분석 실패: ${error.message}`);
  }
}

