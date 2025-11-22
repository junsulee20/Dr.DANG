import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { kakaoLogin, setAuthToken, KakaoLoginResponse, emailLogin } from '@/lib/api';
import { getKakaoAccessToken } from '@/utils/kakaoAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleLoginSuccess = (result: KakaoLoginResponse) => {
    setAuthToken(result.accessToken);
    console.log('✅ 토큰 저장 완료');
    console.log(`✅ ${result.user.name}님 환영합니다!`);
    router.replace('/(tabs)/foodshot' as any);
  };

  const handleLoginError = (error: any, shouldAlert = true): string => {
    console.error('❌ 로그인 에러 발생!');
    console.error('에러 객체:', error);
    console.error('에러 이름:', error?.name);
    console.error('에러 메시지:', error?.message);
    
    let errorMessage = '로그인 중 오류가 발생했습니다.';
    
    if (error?.name === 'AbortError') {
      errorMessage = '요청 시간이 초과되었습니다. 백엔드 서버를 확인해주세요.';
    } else if (error?.message?.includes('fetch')) {
      errorMessage = '네트워크 오류입니다. 백엔드 서버가 실행 중인지 확인하세요.';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    console.error('🔴 에러 메시지:', errorMessage);
    
    if (shouldAlert && typeof window !== 'undefined' && window.alert) {
      window.alert(`로그인 오류\n\n${errorMessage}`);
    }

    return errorMessage;
  };

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

      handleLoginSuccess(result);
    } catch (error: any) {
      handleLoginError(error);
    } finally {
      setKakaoLoading(false);
    }
  };

  // 카카오 로그인 버튼 핸들러
  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    await doLogin();
  };

  const handleEmailChange = (value: string) => {
    if (formError) {
      setFormError(null);
    }
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    if (formError) {
      setFormError(null);
    }
    setPassword(value);
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setFormError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setFormError(null);
    setEmailLoading(true);

    try {
      const result = await emailLogin({
        email: email.trim(),
        password,
      });

      handleLoginSuccess(result);
    } catch (error: any) {
      const message = handleLoginError(error, false);
      setFormError(message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSignupNavigation = () => {
    router.push('/signup' as any);
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
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={handleEmailChange}
            editable={!kakaoLoading && !emailLoading}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={handlePasswordChange}
            editable={!kakaoLoading && !emailLoading}
            returnKeyType="done"
            onSubmitEditing={handleEmailLogin}
          />

          {formError ? (
            <Text style={styles.errorText}>{formError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.emailLoginButton,
              (emailLoading || kakaoLoading) && styles.emailLoginButtonDisabled,
            ]}
            onPress={handleEmailLogin}
            disabled={emailLoading || kakaoLoading}
          >
            {emailLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.emailLoginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 카카오 로그인 버튼 - 주석처리됨 (기능은 유지) */}
        {/* <TouchableOpacity 
          style={[styles.kakaoButton, kakaoLoading && styles.kakaoButtonDisabled]} 
          onPress={handleKakaoLogin}
          disabled={kakaoLoading || emailLoading}
        >
          {kakaoLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          )}
        </TouchableOpacity> */}
        
        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleEmailSignupNavigation}
          disabled={kakaoLoading || emailLoading}
        >
          <Text style={styles.signupButtonText}>이메일로 회원가입하기</Text>
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
  formContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111111',
    marginBottom: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 4,
  },
  emailLoginButton: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  emailLoginButtonDisabled: {
    opacity: 0.6,
  },
  emailLoginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  signupButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111827',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});

