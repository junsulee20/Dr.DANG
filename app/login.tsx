import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  // 로그인 성공 시 자동으로 메인 화면으로 이동
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/(tabs)/foodshot' as any);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      // Supabase Auth를 사용한 카카오 로그인
      await login();
      // 로그인은 비동기로 처리되며, 콜백에서 세션이 설정됩니다
    } catch (error: any) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 실패', error.message || '로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 로고 영역 */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Dr. DANG</Text>
        <Text style={styles.appNameKorean}>닥터당</Text>
        <Text style={styles.tagline}>사진 한 장으로, 당뇨 케어</Text>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.kakaoButton, (isLoading || authLoading) && styles.kakaoButtonDisabled]} 
          onPress={handleKakaoLogin}
          disabled={isLoading || authLoading}
        >
          {(isLoading || authLoading) ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            이미 닥터당의 회원이신가요? 로그인{' '}
            <Text style={styles.arrow}>→</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  appNameKorean: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  kakaoButton: {
    width: '100%',
    backgroundColor: '#FEE500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  kakaoButtonDisabled: {
    opacity: 0.6,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666666',
  },
  arrow: {
    color: '#FF6B35',
  },
});

