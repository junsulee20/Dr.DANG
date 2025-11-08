import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

/**
 * Supabase Auth 콜백 처리 페이지
 * Deep Link로 리다이렉트된 후 여기서 세션을 처리합니다
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 code 추출
        const code = params.code as string;
        
        if (code) {
          // Supabase에서 code를 세션으로 교환
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('세션 교환 실패:', error);
            router.replace('/login');
            return;
          }

          console.log('로그인 성공:', data.user?.id);
          // 메인 화면으로 이동
          router.replace('/(tabs)/foodshot');
        } else {
          // code가 없으면 로그인 화면으로
          router.replace('/login');
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error);
        router.replace('/login');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>로그인 처리 중...</Text>
    </View>
  );
}

