/**
 * Backend API Client
 * 백엔드 API 서버와 통신하는 클라이언트
 */

import Constants from 'expo-constants';

// API 기본 URL (환경변수에서 가져오거나 기본값 사용)
// localhost 대신 127.0.0.1 사용 (IPv6 문제 방지)
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:3001';

/**
 * API 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API 응답 타입
 */
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * 토큰 저장소 (localStorage 사용)
 */
const TOKEN_KEY = 'dr_dang_auth_token';

let authToken: string | null = null;

// 초기화: localStorage에서 토큰 로드
if (typeof window !== 'undefined' && window.localStorage) {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken) {
    authToken = savedToken;
    console.log('✅ 저장된 토큰 복원됨');
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
  
  // localStorage에도 저장
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('✅ 토큰 저장됨 (localStorage)');
    } else {
      localStorage.removeItem(TOKEN_KEY);
      console.log('✅ 토큰 제거됨 (localStorage)');
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * 기본 fetch 래퍼
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 인증 토큰이 있으면 헤더에 추가
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 응답 처리
      throw {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || '알 수 없는 오류가 발생했습니다.',
        details: data.error?.details,
      } as ApiError;
    }

    return data;
  } catch (error: any) {
    if (error.code && error.message) {
      // 이미 ApiError 형식
      throw error;
    }
    // 네트워크 오류 등
    throw {
      code: 'NETWORK_ERROR',
      message: '서버와 연결할 수 없습니다.',
      details: error.message,
    } as ApiError;
  }
}

/**
 * FormData를 사용하는 fetch 래퍼
 */
async function apiFormFetch<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {};

  // 인증 토큰이 있으면 헤더에 추가
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || '알 수 없는 오류가 발생했습니다.',
        details: data.error?.details,
      } as ApiError;
    }

    return data;
  } catch (error: any) {
    if (error.code && error.message) {
      throw error;
    }
    throw {
      code: 'NETWORK_ERROR',
      message: '서버와 연결할 수 없습니다.',
      details: error.message,
    } as ApiError;
  }
}

// ========================================
// 인증 API
// ========================================

export interface KakaoLoginRequest {
  kakaoAccessToken: string;
}

export interface KakaoLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function kakaoLogin(
  kakaoAccessToken: string
): Promise<KakaoLoginResponse> {
  return apiFetch<KakaoLoginResponse>('/auth/kakao', {
    method: 'POST',
    body: JSON.stringify({ kakaoAccessToken }),
  });
}

// ========================================
// 음식 분석 API
// ========================================

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

export async function analyzeFoodImage(
  imageUri: string
): Promise<FoodAnalysisResult> {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // 웹 환경 vs React Native 환경 구분
  if (typeof window !== 'undefined' && window.document) {
    // 웹 환경: URI를 Blob으로 변환
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], filename, { type });
      formData.append('image', file);
    } catch (error) {
      console.error('이미지 Blob 변환 에러:', error);
      throw {
        code: 'IMAGE_CONVERSION_ERROR',
        message: '이미지 변환 중 오류가 발생했습니다.',
      };
    }
  } else {
    // React Native 환경
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  return apiFormFetch<FoodAnalysisResult>('/api/food/analyze', formData);
}

// ========================================
// 식단 기록 API
// ========================================

export interface MealRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  foodName: string;
  imageUrl: string;
  nutrition: {
    carbs: number;
    protein: number;
    fat: number;
  };
  detailedNutrition?: {
    calories: number;
    sugar: number;
    sodium: number;
    ratio: number;
  };
  expectedGlucoseRise?: number;
  recommendations?: string[];
  analysisResult?: any;
  createdAt: string;
}

export interface DayRecordsResponse {
  date: string;
  meals: MealRecord[];
}

export interface MonthRecordsResponse {
  month: string;
  records: MealRecord[];
}

export async function getRecordsByDate(
  date: string
): Promise<DayRecordsResponse> {
  return apiFetch<DayRecordsResponse>(`/api/records?date=${date}`);
}

export async function getRecordsByMonth(
  month: string
): Promise<MonthRecordsResponse> {
  return apiFetch<MonthRecordsResponse>(`/api/records?month=${month}`);
}

// 통합 함수 (date 또는 month 파라미터 지원)
export async function getMealRecords(
  params: { date?: string; month?: string }
): Promise<DayRecordsResponse | MonthRecordsResponse> {
  if (params.date) {
    return getRecordsByDate(params.date);
  } else if (params.month) {
    return getRecordsByMonth(params.month);
  }
  throw new Error('date 또는 month 파라미터가 필요합니다.');
}

export interface CreateRecordRequest {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  foodName: string;
  imageUrl: string;
  analysisResult: FoodAnalysisResult;
}

export interface CreateRecordResponse {
  id: string;
  message: string;
}

export async function createRecord(
  data: CreateRecordRequest
): Promise<CreateRecordResponse> {
  return apiFetch<CreateRecordResponse>('/api/records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// createMealRecord 별칭 (편의를 위해)
export const createMealRecord = createRecord;

export async function deleteRecord(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/records/${id}`, {
    method: 'DELETE',
  });
}

// ========================================
// 사용자 프로필 API
// ========================================

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

export async function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/user/profile');
}

export interface UpdateProfileRequest {
  name?: string;
  height?: number;
  weight?: number;
  profileImageUri?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

export async function updateUserProfile(
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  if (data.profileImageUri) {
    // 이미지가 있으면 FormData 사용
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.height) formData.append('height', data.height.toString());
    if (data.weight) formData.append('weight', data.weight.toString());

    const filename = data.profileImageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // 웹 환경 vs React Native 환경 구분
    if (typeof window !== 'undefined' && window.document) {
      // 웹 환경: URI를 Blob으로 변환
      try {
        const response = await fetch(data.profileImageUri);
        const blob = await response.blob();
        const file = new File([blob], filename, { type });
        formData.append('profileImage', file);
      } catch (error) {
        console.error('프로필 이미지 변환 에러:', error);
        throw {
          code: 'IMAGE_CONVERSION_ERROR',
          message: '이미지 변환 중 오류가 발생했습니다.',
        };
      }
    } else {
      // React Native 환경
      formData.append('profileImage', {
        uri: data.profileImageUri,
        name: filename,
        type,
      } as any);
    }

    const url = `${API_BASE_URL}/api/user/profile`;
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw {
        code: result.error?.code || 'UNKNOWN_ERROR',
        message: result.error?.message || '알 수 없는 오류가 발생했습니다.',
        details: result.error?.details,
      } as ApiError;
    }

    return result;
  } else {
    // 이미지가 없으면 JSON 사용
    return apiFetch<UpdateProfileResponse>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

