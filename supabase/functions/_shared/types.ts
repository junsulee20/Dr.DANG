export interface FoodAnalysisResult {
  foodName: string
  expectedGlucoseRise: number
  actionGuide: string[]
  nutrition: {
    carbs: number
    protein: number
    fat: number
  }
  detailedNutrition: {
    calories: number
    fat: number
    sodium: number
    sugar: number
    ratio: number
  }
  recommendations: string[]
  analysisResult: {
    canRise: boolean
    warning: string
    nutritionSummary?: string
  }
  imageUrl: string
}

export interface Step1Response {
  foodName: string
  estimatedWeight: string
  nutrients: {
    totalCalories: string
    carbohydrates: string
    sugars: string
    protein: string
    fat: string
    sodium: string
  }
}

export interface Step2Response {
  nutritionSummary?: string
  bloodSugarImpact: {
    score: number
    description: string
    warning_icon: 'red' | 'yellow' | 'green'
  }
  tips: Array<{
    type: string
    content: string
  }>
}

