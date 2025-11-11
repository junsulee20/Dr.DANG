import { Request } from 'express';

// 인증된 사용자 정보를 포함한 Request 타입
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// 음식 분석 결과 타입
export interface FoodAnalysisResult {
  foodName: string;
  expectedGlucoseRise: number;
  actionGuide: string[];
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
  imageUrl: string;
}

// 식단 기록 타입
export interface MealRecord {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  foodName: string;
  imageUrl: string;
  expectedGlucoseRise: number;
  nutrition: any;
  detailedNutrition: any;
  recommendations: string[];
  analysisResult: any;
  createdAt: string;
}

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 에러 응답 타입
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

