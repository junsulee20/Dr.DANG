import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getUserFromRequest } from '../_shared/auth.ts'
import { FoodAnalysisResult, Step1Response, Step2Response } from '../_shared/types.ts'

// OpenAI 클라이언트 (Deno용)
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''

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
}`

  const userMessage = `이 음식 사진을 분석하고, 당신의 System Message에 정의된 '엄격한 JSON 형식'으로만 응답해주세요.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
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
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('API 응답이 비어있습니다.')
  }

  const parsed = JSON.parse(content) as Step1Response

  if (!parsed.foodName || !parsed.estimatedWeight || !parsed.nutrients) {
    throw new Error('필수 필드가 누락되었습니다.')
  }

  return parsed
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
3. 'nutritionSummary' 필드에, 제공된 영양성분(예: 단백질, 지방, 나트륨, 칼로리)을 종합적으로 평가하는 '한 줄 요약'을 작성하세요.
4. 'tips'는 매번 다양하고 창의적으로, 전문적인 원리를 쉽게 설명해야 합니다.

절대로 JSON 객체 외의 설명, 인사, 서문(예: "알겠습니다")을 덧붙여서는 안 됩니다.

[반환할 JSON 스키마]

{
  "nutritionSummary": "제공된 데이터를 바탕으로 한 영양 성분(단백질, 지방, 나트륨 등)에 대한 한 줄 평가 및 진단.",
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
      "content": "전문적인 조언. (가이드: **'닭가슴살', '견과류', '채소', '계란' 같은 매우 일반적이고 뻔한 음식 예시를 드는 것을 엄격히 금지합니다.** 또한 특정 음식(예: 낫토, 특정 발효식품 등)을 반복적으로 추천하지 마세요. 대신, 이 음식의 혈당 반응을 늦출 수 있는 **다양하고 구체적인 식재료나 식품군**을 매번 다르게 제안하세요. '왜' 좋은지 **원리**(예: 지방/단백질의 소화 지연, 식이섬유의 역할, 특정 영양소의 상호작용 등)를 설명하되, 음식 예시는 매번 다양하게 선택하세요.)"
    },
    {
      "type": "식사 순서",
      "content": "전문적인 조언. (가이드: '채소/단백질 먼저 드세요'라는 **단순한 순서 나열을 피하세요.** 또한 특정 식재료(예: 식초 등)를 반복적으로 강조하지 마세요. 대신 '왜' 그 순서가 중요한지 **구체적인 '생리학적 원리'**를 한 가지 설명하세요. (예: 위 배출 속도 지연, 특정 호르몬 자극, 소화 효소 활성화, 혈당 조절 메커니즘 등) **매번 다른 원리**를 설명하고, 특정 식재료에 의존하지 말고 원리 자체에 집중하세요.)"
    }
  ]
}`

  const userMessage = `다음은 내가 먹을 음식의 '분석 데이터'입니다:

${JSON.stringify(step1Result, null, 2)}

이 데이터를 바탕으로, 당신의 System Message에 정의된 '조언 JSON'을 생성해주세요.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
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
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('API 응답이 비어있습니다.')
  }

  const parsed = JSON.parse(content) as Step2Response

  if (!parsed.bloodSugarImpact || !parsed.tips || !Array.isArray(parsed.tips)) {
    throw new Error('필수 필드가 누락되었습니다.')
  }

  return parsed
}

/**
 * 숫자 추출 유틸리티
 */
function extractNumber(str: string): number {
  const match = str.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

/**
 * Uint8Array를 base64로 안전하게 변환 (큰 파일 지원)
 * spread operator 사용을 최소화하여 스택 오버플로우 방지
 */
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  // 작은 배열은 직접 변환
  if (uint8Array.length <= 16384) { // 16KB 이하는 안전
    return btoa(String.fromCharCode(...uint8Array))
  }
  
  // 큰 배열은 작은 청크 단위로 처리
  let binaryString = ''
  const chunkSize = 1024 // 1KB 청크 (스택 오버플로우 방지)
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length))
    // 작은 청크는 spread operator 사용 가능
    binaryString += String.fromCharCode(...chunk)
  }
  
  return btoa(binaryString)
}

/**
 * 통합 음식 분석 함수
 */
async function analyzeFood(
  imageBase64: string,
  imageUrl: string
): Promise<FoodAnalysisResult> {
  // Step 1: 음식 이미지 분석
  const step1Result = await analyzeFoodImage(imageBase64)

  // Step 2: 조언 생성
  const step2Result = await generateAdvice(step1Result)

  // 결과 조합
  const carbs = extractNumber(step1Result.nutrients.carbohydrates)
  const protein = extractNumber(step1Result.nutrients.protein)
  const fat = extractNumber(step1Result.nutrients.fat)
  const sugar = extractNumber(step1Result.nutrients.sugars)
  const sodium = extractNumber(step1Result.nutrients.sodium)
  const calories = extractNumber(step1Result.nutrients.totalCalories)

  // 혈당 상승치 계산 (탄수화물 기반 간단한 추정)
  const expectedGlucoseRise = Math.round(carbs * 1.5)

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
      ...(step2Result.nutritionSummary && { nutritionSummary: step2Result.nutritionSummary }),
    },
    imageUrl,
  }

  return result
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // 인증 확인
    const user = await getUserFromRequest(req)
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // FormData에서 이미지 추출
    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이미지 파일이 필요합니다.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 파일 크기 검증 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이미지 크기는 10MB를 초과할 수 없습니다.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 이미지 타입 검증
    if (!imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이미지 파일만 업로드 가능합니다.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 1. 이미지를 Supabase Storage에 업로드
    const fileName = `${user.id}/${Date.now()}_${imageFile.name}`
    const arrayBuffer = await imageFile.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
      .from('food-images')
      .upload(fileName, arrayBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: '이미지 업로드 중 오류가 발생했습니다.',
            details: uploadError.message,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 2. 업로드된 이미지의 공개 URL 가져오기
    const { data: urlData } = supabaseAdmin.storage
      .from('food-images')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    // 3. 이미지를 base64로 변환 (큰 파일을 위한 안전한 처리)
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = uint8ArrayToBase64(uint8Array)
    const imageBase64 = `data:${imageFile.type};base64,${base64}`

    // 4. GPT API로 음식 분석
    const analysisResult = await analyzeFood(imageBase64, imageUrl)

    // 5. 결과 반환
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Food analysis error:', error)

    if (error.message.includes('음식 분석 실패') || error.message.includes('OpenAI API')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'GPT API 서비스 오류입니다.',
            details: error.message,
          },
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: '음식 분석 중 오류가 발생했습니다.',
          details: error.message,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

