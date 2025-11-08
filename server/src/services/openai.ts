import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FoodAnalysisResult {
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }>;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}

/**
 * 음식 이미지를 분석하여 영양 정보를 추출합니다.
 */
export async function analyzeFoodImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<FoodAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  // 이미지를 base64로 변환
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview', // 또는 'gpt-4o' (최신 모델)
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `이 이미지에 있는 음식들을 분석해주세요. 각 음식의 이름, 양(예: 1인분, 200g 등), 칼로리, 탄수화물(g), 단백질(g), 지방(g)을 추정해주세요. 
응답은 다음 JSON 형식으로 해주세요:
{
  "foods": [
    {
      "name": "음식 이름",
      "quantity": "양",
      "calories": 칼로리,
      "carbs": 탄수화물(g),
      "protein": 단백질(g),
      "fat": 지방(g)
    }
  ],
  "totalCalories": 전체 칼로리,
  "totalCarbs": 전체 탄수화물(g),
  "totalProtein": 전체 단백질(g),
  "totalFat": 전체 지방(g)
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
    }

    const analyzedData: FoodAnalysisResult = JSON.parse(jsonMatch[0]);

    // 검증
    if (!analyzedData.foods || !Array.isArray(analyzedData.foods)) {
      throw new Error('잘못된 분석 결과 형식입니다.');
    }

    return analyzedData;
  } catch (error: any) {
    console.error('OpenAI 분석 오류:', error);
    throw new Error(`음식 분석 실패: ${error.message}`);
  }
}

