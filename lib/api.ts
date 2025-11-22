/**
 * Backend API Client
 * 백엔드 API 서버와 통신하는 클라이언트
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Supabase Edge Functions URL
// 환경변수에서 가져오거나 기본값 사용
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Edge Functions 기본 URL
const EDGE_FUNCTIONS_BASE_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : 'http://127.0.0.1:3001';

// 디버깅: 환경 변수 확인
if (__DEV__) {
  console.log('🔵 Supabase 설정:');
  console.log('  SUPABASE_URL:', SUPABASE_URL || '(설정되지 않음)');
  console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : '(설정되지 않음)');
  console.log('  EDGE_FUNCTIONS_BASE_URL:', EDGE_FUNCTIONS_BASE_URL);
}

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
 * 토큰 저장소 (SecureStore 사용)
 */
const TOKEN_KEY = 'dr_dang_auth_token';

let authToken: string | null = null;
let authTokenReady: Promise<void> | null = null;

async function loadTokenFromStore() {
  try {
    const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (savedToken) {
      authToken = savedToken;
      console.log('✅ 저장된 토큰 복원됨 (SecureStore)');
    }
  } catch (error) {
    console.error('SecureStore에서 토큰 로드 실패:', error);
  }
}

function ensureAuthTokenLoaded(): Promise<void> {
  if (!authTokenReady) {
    authTokenReady = loadTokenFromStore();
  }
  return authTokenReady;
}

ensureAuthTokenLoaded();

export async function setAuthToken(token: string | null) {
  authToken = token;

  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('✅ 토큰 저장됨 (SecureStore)');
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('✅ 토큰 제거됨 (SecureStore)');
    }
  } catch (error) {
    console.error('SecureStore 토큰 저장 오류:', error);
  } finally {
    authTokenReady = Promise.resolve();
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
  // 토큰이 메모리에 없으면 SecureStore에서 로드
  await ensureAuthTokenLoaded();
  
  // 최신 토큰 확인 (로그인 직후 토큰이 메모리에 있을 수 있음)
  if (!authToken) {
    try {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (savedToken) {
        authToken = savedToken;
        console.log('✅ API 호출 전 토큰 복원됨');
      }
    } catch (error) {
      console.error('토큰 로드 실패:', error);
    }
  }

  // endpoint가 이미 전체 URL인 경우 그대로 사용, 아니면 Edge Functions URL과 결합
  const url = endpoint.startsWith('http') ? endpoint : `${EDGE_FUNCTIONS_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Supabase Edge Functions 인증 헤더
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    // Edge Function 게이트웨이 통과용
    if (!headers['Authorization']) {
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
  }

  // 앱 자체 인증 토큰을 별도 헤더로 전달
  if (authToken) {
    headers['x-user-token'] = authToken;
    console.log('✅ 인증 토큰 헤더 포함됨 (길이:', authToken.length, ')');
  } else {
    console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요할 수 있습니다.');
  }

  try {
    console.log('🔵 API 호출:', url);
    console.log('🔵 Headers:', { ...headers, 'x-user-token': authToken ? `${authToken.substring(0, 20)}...` : '(없음)' });
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error('❌ API 응답 오류:', response.status, response.statusText);
    }

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
  // 토큰이 메모리에 없으면 SecureStore에서 로드
  await ensureAuthTokenLoaded();
  
  // 최신 토큰 확인 (로그인 직후 토큰이 메모리에 있을 수 있음)
  if (!authToken) {
    try {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (savedToken) {
        authToken = savedToken;
        console.log('✅ API 호출 전 토큰 복원됨 (FormData)');
      }
    } catch (error) {
      console.error('토큰 로드 실패:', error);
    }
  }

  // endpoint가 이미 전체 URL인 경우 그대로 사용, 아니면 Edge Functions URL과 결합
  const url = endpoint.startsWith('http') ? endpoint : `${EDGE_FUNCTIONS_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {};

  // Supabase Edge Functions 인증 헤더
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    if (!headers['Authorization']) {
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
  }

  if (authToken) {
    headers['x-user-token'] = authToken;
    console.log('✅ 인증 토큰 헤더 포함됨 (FormData, 길이:', authToken.length, ')');
  } else {
    console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요할 수 있습니다. (FormData)');
  }

  try {
    console.log('🔵 API 호출 (FormData):', url);
    console.log('🔵 Headers:', { ...headers, 'x-user-token': authToken ? `${authToken.substring(0, 20)}...` : '(없음)' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      console.error('❌ API 응답 오류:', response.status, response.statusText);
    }

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
  console.log('🔵 API 호출: POST /auth/kakao');
  try {
    const result = await apiFetch<KakaoLoginResponse>('/auth/kakao', {
      method: 'POST',
      body: JSON.stringify({ kakaoAccessToken }),
    });
    console.log('✅ 백엔드 응답 성공:', result.user.name);
    return result;
  } catch (error: any) {
    console.error('❌ 백엔드 응답 에러:', error);
    throw error;
  }
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface EmailSignupRequest {
  name: string;
  email: string;
  password: string;
  height: number;
  weight: number;
}

export async function emailLogin(
  credentials: EmailLoginRequest
): Promise<KakaoLoginResponse> {
  console.log('🔵 API 호출: POST /auth-email/login');
  try {
    // Edge Functions URL: /functions/v1/auth-email/login
    const result = await apiFetch<KakaoLoginResponse>(`${EDGE_FUNCTIONS_BASE_URL}/auth-email/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('✅ 이메일 로그인 성공:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ 이메일 로그인 에러:', error);
    throw error;
  }
}

export async function emailSignup(
  payload: EmailSignupRequest
): Promise<KakaoLoginResponse> {
  console.log('🔵 API 호출: POST /auth-email/signup');
  try {
    // Edge Functions URL: /functions/v1/auth-email/signup
    const result = await apiFetch<KakaoLoginResponse>(`${EDGE_FUNCTIONS_BASE_URL}/auth-email/signup`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('✅ 이메일 회원가입 성공:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('❌ 이메일 회원가입 에러:', error);
    throw error;
  }
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
  await ensureAuthTokenLoaded();

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

  // Edge Functions URL 사용
  const url = `${EDGE_FUNCTIONS_BASE_URL}/food-analyze`;
  const headers: HeadersInit = {};
  
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  
  if (authToken) {
    headers['x-user-token'] = authToken;
  }

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
  return apiFetch<DayRecordsResponse>(`/records?date=${date}`);
}

export async function getRecordsByMonth(
  month: string
): Promise<MonthRecordsResponse> {
  return apiFetch<MonthRecordsResponse>(`/records?month=${month}`);
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
  return apiFetch<CreateRecordResponse>(`${EDGE_FUNCTIONS_BASE_URL}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// createMealRecord 별칭 (편의를 위해)
export const createMealRecord = createRecord;

export async function deleteRecord(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${EDGE_FUNCTIONS_BASE_URL}/records/${id}`, {
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
  return apiFetch<UserProfile>(`${EDGE_FUNCTIONS_BASE_URL}/user-profile`);
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

    const url = `${EDGE_FUNCTIONS_BASE_URL}/user-profile`;
    const headers: HeadersInit = {};
    
    await ensureAuthTokenLoaded();

    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY;
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
    
    if (authToken) {
      headers['x-user-token'] = authToken;
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
    return apiFetch<UpdateProfileResponse>(`${EDGE_FUNCTIONS_BASE_URL}/user-profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

