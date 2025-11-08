// API 엔드포인트 상수
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  (__DEV__ ? 'http://localhost:3001' : 'https://your-production-api-url.com');

export const API_ENDPOINTS = {
  AUTH: {
    KAKAO: `${API_BASE_URL}/auth/kakao`,
  },
  FOOD: {
    ANALYZE: `${API_BASE_URL}/api/food/analyze`,
  },
  RECORDS: {
    LIST: `${API_BASE_URL}/api/records`,
    CREATE: `${API_BASE_URL}/api/records`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/user/profile`,
  },
} as const;

