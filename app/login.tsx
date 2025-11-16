import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { kakaoLogin, setAuthToken } from '@/lib/api';
import { getKakaoAccessToken } from '@/utils/kakaoAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 실제 카카오 로그인 처리
  const doLogin = async () => {
    try {
      console.log('🔵 카카오 OAuth 시작...');

      const kakaoAccessToken = await getKakaoAccessToken();
      console.log('🔵 카카오 Access Token:', kakaoAccessToken ? '받음 ✅' : '실패 ❌');
      
      if (!kakaoAccessToken) {
        throw new Error('카카오 로그인에 실패했습니다. 팝업이 차단되었거나 동의를 취소했을 수 있습니다.');
      }

      console.log('🔵 백엔드 카카오 로그인 요청... (토큰 길이:', kakaoAccessToken.length, ')');
      const result = await kakaoLogin(kakaoAccessToken);

      // JWT 토큰 저장
      setAuthToken(result.accessToken);
      console.log('✅ 토큰 저장 완료');
      console.log(`✅ ${result.user.name}님 환영합니다!`);

      router.replace('/(tabs)/foodshot' as any);
    } catch (error: any) {
      console.error('❌ 로그인 에러 발생!');
      console.error('에러 객체:', error);
      console.error('에러 이름:', error?.name);
      console.error('에러 메시지:', error?.message);
      
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (error?.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다. 백엔드 서버를 확인해주세요.';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = '네트워크 오류입니다. 백엔드 서버가 실행 중인지 확인하세요.';
      } else {
        errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.';
      }
      
      console.error('🔴 에러 메시지:', errorMessage);
      
      // 웹 환경에서는 Alert 대신 콘솔 출력
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`로그인 오류\n\n${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인 버튼 핸들러
  const handleKakaoLogin = async () => {
    setLoading(true);
    await doLogin();
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
          style={[styles.kakaoButton, loading && styles.kakaoButtonDisabled]} 
          onPress={handleKakaoLogin}
          disabled={loading}
        >
          {loading ? (
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
    opacity: 0.5,
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

