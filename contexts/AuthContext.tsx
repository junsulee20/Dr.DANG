import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser, signInWithKakao, signOut } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

interface User {
  id: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase User를 앱 User로 변환
// 카카오에서 받을 수 있는 정보가 제한적이므로 optional 필드 처리
function transformUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  // 카카오에서 받을 수 있는 정보 (사용자가 동의한 정보만)
  const nickname = supabaseUser.user_metadata?.nickname 
    || supabaseUser.user_metadata?.full_name 
    || supabaseUser.user_metadata?.name
    || `사용자_${supabaseUser.id.substring(0, 8)}`; // 기본값 설정

  const email = supabaseUser.email || undefined; // optional
  const profileImage = supabaseUser.user_metadata?.avatar_url 
    || supabaseUser.user_metadata?.picture 
    || supabaseUser.user_metadata?.profile_image
    || undefined; // optional

  return {
    id: supabaseUser.id,
    email,
    nickname,
    profileImage,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 세션 확인 및 Deep Link 처리
  useEffect(() => {
    // 초기 세션 로드
    loadSession();

    // Deep Link 리스너 설정
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Supabase Auth 상태 변경 리스너
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(transformUser(session?.user ?? null));
        setIsLoading(false);
      }
    );

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  const loadSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(transformUser(session?.user ?? null));
    } catch (error) {
      console.error('세션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepLink = async (event: { url: string }) => {
    const url = new URL(event.url);
    
    // Supabase Auth 콜백 처리
    if (url.pathname === '/auth/callback') {
      const code = url.searchParams.get('code');
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          console.log('세션 교환 성공:', data);
        } catch (error) {
          console.error('세션 교환 실패:', error);
        }
      }
    }
  };

  const login = async () => {
    try {
      await signInWithKakao();
      // signInWithOAuth는 브라우저를 열고, 콜백에서 handleDeepLink가 처리합니다
    } catch (error: any) {
      console.error('로그인 오류:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        logout,
        isAuthenticated: !!session && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

