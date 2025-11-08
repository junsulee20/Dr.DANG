import { API_ENDPOINTS } from '@/constants/api';

/**
 * API 요청 헤더 생성 (인증 토큰 포함)
 * Supabase 세션의 access_token을 백엔드에 전달
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  // Supabase 세션에서 액세스 토큰 가져오기
  const { supabase } = await import('@/lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Supabase access_token을 백엔드에 전달
  // 백엔드의 authenticateSupabaseToken 미들웨어가 이를 검증합니다
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers as HeadersInit;
}

/**
 * API 요청 래퍼 (에러 처리 포함)
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.message || error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * 음식 이미지 분석 API 호출
 */
export async function analyzeFoodImage(imageUri: string): Promise<any> {
  // 이미지를 FormData로 변환
  const formData = new FormData();
  
  // React Native에서는 이미지 URI를 사용
  // @ts-ignore - React Native FormData
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'food.jpg',
  } as any);

  const headers = await getAuthHeaders();
  // FormData를 사용할 때는 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
  // 하지만 React Native에서는 명시적으로 제거해야 함
  const finalHeaders: any = { ...headers };
  delete finalHeaders['Content-Type'];

  const response = await fetch(API_ENDPOINTS.FOOD.ANALYZE, {
    method: 'POST',
    headers: finalHeaders,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.message || error.message || '음식 분석 실패');
  }

  return response.json();
}

/**
 * 식단 기록 조회
 */
export async function getFoodRecords(params?: {
  date?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.mealType) queryParams.append('mealType', params.mealType);

  const url = `${API_ENDPOINTS.RECORDS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(url);
}

/**
 * 식단 기록 생성
 */
export async function createFoodRecord(data: {
  imageUrl: string;
  analyzedData: any;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recordedAt?: string;
}): Promise<any> {
  return apiRequest(API_ENDPOINTS.RECORDS.CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 프로필 조회
 */
export async function getUserProfile(): Promise<any> {
  return apiRequest(API_ENDPOINTS.USER.PROFILE);
}

/**
 * 프로필 업데이트
 */
export async function updateUserProfile(data: {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  diabetesType?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  targetCalories?: number;
}): Promise<any> {
  return apiRequest(API_ENDPOINTS.USER.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

