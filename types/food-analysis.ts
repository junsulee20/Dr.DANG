// Step 1 API 응답 타입
export interface Step1Response {
  foodName: string;
  estimatedWeight: string; // 예: "150g"
  nutrients: {
    totalCalories: string; // 예: "195kcal"
    carbohydrates: string; // 예: "45g"
    sugars: string; // 예: "13g"
    protein: string; // 예: "3g"
    fat: string; // 예: "0.3g"
    sodium: string; // 예: "60mg"
  };
}

// Step 2 API 응답 타입
export interface Step2Response {
  bloodSugarImpact: {
    score: number; // 1-100
    description: string;
    warning_icon: 'red' | 'yellow' | 'green';
  };
  tips: Array<{
    type: string; // "양 조절", "보완 음식", "식사 순서"
    content: string;
  }>;
}

// 최종 병합된 결과 타입
export interface FoodAnalysisResult {
  step1: Step1Response;
  step2: Step2Response;
  imageUri?: string; // 원본 이미지 URI
}

