import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 웹 환경과 네이티브 환경에 맞는 스토리지 선택
const getStorage = () => {
  if (Platform.OS === 'web') {
    // 웹 환경: localStorage 사용
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // 네이티브 환경: AsyncStorage 사용
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage;
    } catch (error) {
      console.warn('AsyncStorage를 로드할 수 없습니다. 기본 스토리지 사용');
      // Fallback: 메모리 스토리지
      const memoryStorage: Record<string, string> = {};
      return {
        getItem: (key: string) => Promise.resolve(memoryStorage[key] || null),
        setItem: (key: string, value: string) => {
          memoryStorage[key] = value;
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          delete memoryStorage[key];
          return Promise.resolve();
        },
      };
    }
  }
};

const storage = getStorage();

// Supabase 클라이언트 생성 (프론트엔드용)
// Expo에서는 app.config.js의 extra 필드나 환경 변수에서 값을 가져옵니다
const getSupabaseConfig = () => {
  // 1. 환경 변수에서 먼저 시도 (EXPO_PUBLIC_ 접두사)
  let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // 2. app.config.js의 extra 필드에서 시도
  if (!supabaseUrl || !supabaseAnonKey) {
    const extra = Constants.expoConfig?.extra;
    supabaseUrl = supabaseUrl || extra?.supabaseUrl;
    supabaseAnonKey = supabaseAnonKey || extra?.supabaseAnonKey;
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseAnonKey: supabaseAnonKey || '',
  };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// 디버깅을 위한 로그 (개발 환경에서만)
if (__DEV__) {
  console.log('[Supabase Config]', {
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '없음',
    supabaseAnonKey: supabaseAnonKey ? '설정됨' : '없음',
    fromEnv: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    fromConstants: !!Constants.expoConfig?.extra?.supabaseUrl,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Supabase URL과 Anon Key가 설정되지 않았습니다.
  
환경 변수: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '설정됨' : '없음'}
Constants.extra: ${Constants.expoConfig?.extra?.supabaseUrl ? '설정됨' : '없음'}

해결 방법:
1. 프론트엔드 루트에 .env 파일 생성
2. 또는 app.config.js의 extra 필드 확인
`;
  console.error('[Supabase Error]', errorMsg);
  throw new Error(errorMsg);
}

// Deep linking을 위한 URL 생성
// Supabase Auth 콜백은 Supabase Redirect URI로 리다이렉트되고,
// 그 후 앱 스킴으로 다시 리다이렉트됩니다
const getDeepLinkUrl = () => {
  // Supabase Redirect URI 사용 (Supabase가 처리 후 앱으로 리다이렉트)
  if (supabaseUrl) {
    return `${supabaseUrl}/auth/v1/callback`;
  }
  // Fallback: 앱 스킴 사용
  const scheme = 'drdang';
  return `${scheme}://auth/callback`;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

/**
 * 카카오 로그인 (Supabase Auth 사용)
 * profile_nickname만 요청하도록 설정
 */
export async function signInWithKakao() {
  const redirectTo = getDeepLinkUrl();
  
  console.log('[Kakao Login] Redirect URI:', redirectTo);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
      // 카카오 동의 항목 최소화
      // profile_nickname만 요청 (이메일, 프로필 사진 불필요)
      // Scopes는 Supabase Dashboard에서 설정하거나
      // 여기서 queryParams로 지정 가능
    },
  });

  if (error) {
    console.error('[Kakao Login Error]', error);
    console.error('[Kakao Login Error Details]', {
      message: error.message,
      status: error.status,
    });
    throw error;
  }

  console.log('[Kakao Login] Success, URL:', data?.url);
  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
}

/**
 * 세션 가져오기
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}

