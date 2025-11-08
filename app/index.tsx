import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 초기 화면 - 인증 상태에 따라 로그인 또는 메인 화면으로 리다이렉트
 */
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // 로그인된 경우 메인 화면으로
        router.replace('/(tabs)/foodshot');
      } else {
        // 로그인되지 않은 경우 로그인 화면으로
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중 표시
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={{ marginTop: 16, color: '#666666' }}>로딩 중...</Text>
    </View>
  );
}
