import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * 카카오 OAuth 콜백 페이지 (웹 전용)
 * 팝업 창에서 카카오 로그인 후 이 페이지로 리다이렉트됩니다.
 * URL에서 authorization code를 추출하여 부모 창으로 전달합니다.
 */
export default function KakaoCallbackScreen() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.opener) {
      return;
    }

    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('Kakao OAuth error:', error);
        window.opener.postMessage(
          { type: 'kakao-auth-cancel', error },
          window.location.origin
        );
        window.close();
        return;
      }

      if (code) {
        // 부모 창으로 authorization code 전달
        window.opener.postMessage(
          { type: 'kakao-auth-code', code },
          window.location.origin
        );
        // 팝업 창은 부모 창에서 닫음
      } else {
        console.error('No code in callback URL');
        window.opener.postMessage(
          { type: 'kakao-auth-cancel' },
          window.location.origin
        );
        window.close();
      }
    } catch (e) {
      console.error('Callback processing error:', e);
      if (window.opener) {
        window.opener.postMessage(
          { type: 'kakao-auth-cancel' },
          window.location.origin
        );
      }
      window.close();
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FEE500" />
      <Text style={styles.text}>카카오 로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
  },
});

