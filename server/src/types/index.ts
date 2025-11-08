export interface User {
  id: string;
  kakaoId: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodRecord {
  id: string;
  userId: string;
  imageUrl: string;
  analyzedData: {
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
  };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  diabetesType?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  targetCalories?: number;
  createdAt: Date;
  updatedAt: Date;
}

