import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

// Supabase 클라이언트 생성 (프론트엔드용)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 설정되지 않았습니다.');
}

// Deep linking을 위한 URL 생성
// Supabase Auth 콜백은 Supabase Redirect URI로 리다이렉트되고,
// 그 후 앱 스킴으로 다시 리다이렉트됩니다
const getDeepLinkUrl = () => {
  // Supabase Redirect URI 사용 (Supabase가 처리 후 앱으로 리다이렉트)
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  if (supabaseUrl) {
    return `${supabaseUrl}/auth/v1/callback`;
  }
  // Fallback: 앱 스킴 사용
  const scheme = 'drdang';
  return `${scheme}://auth/callback`;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

/**
 * 카카오 로그인 (Supabase Auth 사용)
 */
export async function signInWithKakao() {
  const redirectTo = getDeepLinkUrl();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });

  if (error) {
    throw error;
  }

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

