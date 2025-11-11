import { Step1Response, Step2Response } from '@/types/food-analysis';
import Constants from 'expo-constants';
import OpenAI from 'openai';

// 환경 변수에서 API 키 가져오기
// ⚠️ 주의: 이 파일은 더 이상 사용하지 않습니다!
// 백엔드 API(lib/api.ts)를 통해 음식 분석을 호출하세요.
const getApiKey = (): string => {
  // Expo에서는 Constants.expoConfig.extra를 통해 app.json의 extra 필드 접근
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;
  if (!apiKey) {
    console.warn('⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 백엔드 API를 사용하세요.');
    return ''; // 에러 대신 빈 문자열 반환
  }
  return apiKey as string;
};

// OpenAI 클라이언트 (더 이상 사용하지 않음 - 백엔드에서 처리)
const openai = new OpenAI({
  apiKey: getApiKey() || 'dummy-key',
  dangerouslyAllowBrowser: true, // 브라우저 환경에서 사용 허용 (보안 주의)
});

/**
 * Step 1: 음식 이미지 분석
 * @param imageBase64 base64로 인코딩된 이미지 데이터 (data:image/jpeg;base64,... 형식)
 * @returns 음식 분석 결과
 */
export async function analyzeFoodImage(imageBase64: string): Promise<Step1Response> {
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

  try {
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
      response_format: { type: 'json_object' }, // JSON 형식 강제
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API 응답이 비어있습니다.');
    }

    console.log('Step 1 API 응답 내용:', content);

    // JSON 파싱 - 여러 방법 시도
    let parsed: Step1Response;
    
    try {
      // 방법 1: 직접 JSON 파싱 시도
      parsed = JSON.parse(content) as Step1Response;
    } catch (e) {
      // 방법 2: 코드 블록 제거 후 파싱
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      try {
        parsed = JSON.parse(cleanedContent) as Step1Response;
      } catch (e2) {
        // 방법 3: 정규식으로 JSON 추출
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('JSON을 찾을 수 없습니다. 응답 내용:', content);
          throw new Error('JSON 형식을 찾을 수 없습니다. 응답: ' + content.substring(0, 200));
        }
        
        try {
          parsed = JSON.parse(jsonMatch[0]) as Step1Response;
        } catch (e3) {
          console.error('JSON 파싱 실패:', e3);
          throw new Error('JSON 파싱에 실패했습니다. 응답: ' + content.substring(0, 200));
        }
      }
    }
    
    // 기본 검증
    if (!parsed.foodName || !parsed.estimatedWeight || !parsed.nutrients) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    return parsed;
  } catch (error: any) {
    console.error('Step 1 API 에러:', error);
    throw new Error(`음식 분석 실패: ${error.message}`);
  }
}

/**
 * Step 2: 당뇨 환자를 위한 조언 생성
 * @param step1Result Step 1의 분석 결과
 * @returns 조언 결과
 */
export async function generateAdvice(step1Result: Step1Response): Promise<Step2Response> {
  const systemMessage = `당신은 'Dr.DANG' 소속의 전문 영양학자이자 당뇨 관리 코치입니다.
당신의 임무는 사용자가 제공한 '음식 분석 데이터'를 바탕으로, 당뇨 환자를 위한 '조언' 부분을 생성하는 것입니다.

[지침]
1.  제공된 수치를 바탕으로 혈당 영향 '점수(score)'를 매기세요.
2.  수치를 '반복'하지 말고, 'bloodSugarImpact.description'에 그 수치가 '어떤 의미'인지 해석하여 작성하세요.
3.  'nutritionSummary' 필드에, 제공된 영양성분(예: 단백질, 지방, 나트륨, 칼로리)을 종합적으로 평가하는 '한 줄 요약'을 작성하세요.
4.  'tips'는 매번 다양하고 창의적으로, 전문적인 원리를 쉽게 설명해야 합니다.
5.  절대로 JSON 객체 외의 설명, 인사, 서문(예: "알겠습니다")을 덧붙여서는 안 됩니다.

[반환할 JSON 스키마]
{
  "nutritionSummary": "제공된 데이터를 바탕으로 한 영양 성분(단백질, 지방, 나트륨 등)에 대한 한 줄 평가 및 진단.",
  "bloodSugarImpact": {
    "score": "제공된 데이터를 바탕으로 계산한 1-100점 사이의 혈당 영향 점수",
    "description": "전문적인 해석. (가이드: 이 점수와 영양소(특히 탄수화물, 당류)를 바탕으로, 이 음식이 혈당을 '얼마나 빠르고 높게' 또는 '얼마나 완만하게' 올릴 것인지 **구체적인 '혈당 변화 양상'을 예측**하고, 그것이 당뇨 환자에게 어떤 의미인지 설명하세요.)",
    "warning_icon": "score에 따른 신호등 색상. [기준: score >= 60 이면 'red', 30 <= score < 60 이면 'yellow', score < 30 이면 'green']"
  },
  "tips": [
    {
      "type": "양 조절",
      "content": "전문적인 조언. (가이드: '절반으로 줄이세요' 같은 **단순하고 반복적인 조언을 피하세요.** 대신, 이 음식의 총 탄수화물을 기준으로 '다른 끼니의 탄수화물과 어떻게 교환'할 수 있는지, 또는 '총 섭취 탄수화물 목표(예: 20g)에 맞추려면' 어떻게 해야 하는지 등 **실천적인 방법론**을 제안하세요.)"
    },
    {
      "type": "보완 음식",
      "content": "전문적인 조언. (가이드: '닭가슴살', '견과류', '채소', '계란' 같은 일반적인 예시에만 의존하지 마세요. 물론 이들도 좋은 음식이지만, 매번 반복해서는 안 됩니다. 대신, 이 음식의 혈당 반응을 늦출 수 있는 '구체적이고 덜 흔한' 식재료나 식품군을 '왜' 좋은지(예: 지방/단백질의 소화 지연, 발효 식품의 이점 등) 원리와 함께 생리학적 원리와 함께 적극적으로, 그리고 창의적으로 제안하세요.)
    },
    {
      "type": "식사 순서",
      "content": "전문적인 조언. (가이드: '채소/단백질 먼저 드세요'라는 **단순한 순서 나열을 피하세요.** 대신 '왜' 그 순서가 중요한지 **구체적인 '생리학적 원리'**를 한 가지 설명하세요. (예: 위 배출 속도 지연, 특정 호르몬 자극, 산(acid)의 영향 등) **매번 다른 원리**를 적극적으로, 그리고 창의적으로 설명하도록 노력하세요.)"
    }
  ]
}`

  const userMessage = `다음은 내가 먹을 음식의 '분석 데이터'입니다:

${JSON.stringify(step1Result, null, 2)}

이 데이터를 바탕으로, 당신의 System Message에 정의된 '조언 JSON'을 생성해주세요.`;

  try {
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
      response_format: { type: 'json_object' }, // JSON 형식 강제
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API 응답이 비어있습니다.');
    }

    console.log('Step 2 API 응답 내용:', content);

    // JSON 파싱 - 여러 방법 시도
    let parsed: Step2Response;
    
    try {
      // 방법 1: 직접 JSON 파싱 시도
      parsed = JSON.parse(content) as Step2Response;
    } catch (e) {
      // 방법 2: 코드 블록 제거 후 파싱
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      try {
        parsed = JSON.parse(cleanedContent) as Step2Response;
      } catch (e2) {
        // 방법 3: 정규식으로 JSON 추출
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('JSON을 찾을 수 없습니다. 응답 내용:', content);
          throw new Error('JSON 형식을 찾을 수 없습니다. 응답: ' + content.substring(0, 200));
        }
        
        try {
          parsed = JSON.parse(jsonMatch[0]) as Step2Response;
        } catch (e3) {
          console.error('JSON 파싱 실패:', e3);
          throw new Error('JSON 파싱에 실패했습니다. 응답: ' + content.substring(0, 200));
        }
      }
    }
    
    // 기본 검증
    if (!parsed.bloodSugarImpact || !parsed.tips || !Array.isArray(parsed.tips)) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    return parsed;
  } catch (error: any) {
    console.error('Step 2 API 에러:', error);
    throw new Error(`조언 생성 실패: ${error.message}`);
  }
}

