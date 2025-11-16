import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

/**
 * 웹 환경에서 카카오 OAuth 팝업 처리
 */
async function webKakaoOAuth(authUrl: string, clientId: string, redirectUri: string): Promise<string | null> {
  return new Promise((resolve) => {
    console.log('🔵 웹 카카오 OAuth 시작...');
    console.log('🔵 Redirect URI:', redirectUri);
    console.log('🔵 Auth URL:', authUrl);
    
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'kakaoLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      console.error('❌ 팝업이 차단되었습니다. 브라우저 팝업 차단을 해제해주세요.');
      resolve(null);
      return;
    }
    
    console.log('✅ 카카오 로그인 팝업 열림');

    // 팝업 메시지 수신 대기
    const messageHandler = async (event: MessageEvent) => {
      // 보안: 카카오에서 온 메시지인지 확인
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'kakao-auth-code' && event.data?.code) {
        console.log('✅ Authorization code 받음:', event.data.code.substring(0, 20) + '...');
        window.removeEventListener('message', messageHandler);
        popup.close();

        try {
          console.log('🔵 카카오 토큰 교환 중...');
          // Authorization code를 access token으로 교환
          const tokenResp = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: clientId,
              redirect_uri: redirectUri,
              code: event.data.code,
            }).toString(),
          });

          if (!tokenResp.ok) {
            const errorText = await tokenResp.text();
            console.error('❌ 카카오 토큰 교환 실패:', errorText);
            resolve(null);
            return;
          }

          const tokenJson = await tokenResp.json();
          console.log('✅ Access Token 받음:', tokenJson.access_token.substring(0, 20) + '...');
          resolve(tokenJson.access_token);
        } catch (e) {
          console.error('❌ 토큰 교환 에러:', e);
          resolve(null);
        }
      } else if (event.data?.type === 'kakao-auth-cancel') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(null);
      }
    };

    window.addEventListener('message', messageHandler);

    // 팝업이 닫혔는지 주기적으로 확인
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        resolve(null);
      }
    }, 500);
  });
}

export async function getKakaoAccessToken(): Promise<string | null> {
  const clientId =
    (Constants.expoConfig?.extra as any)?.kakaoClientId ||
    process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
  
  // 웹에서는 현재 URL을 redirect URI로 사용
  const isWeb = Platform.OS === 'web';
  const redirectUri = isWeb 
    ? window.location.origin + '/auth/kakao/callback'
    : ((Constants.expoConfig?.extra as any)?.kakaoRedirectUri ||
      process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ||
      'drdang://auth/kakao');

  console.log('🔵 Platform:', Platform.OS);
  console.log('🔵 Client ID:', clientId ? clientId.substring(0, 10) + '...' : 'MISSING ❌');
  console.log('🔵 Redirect URI:', redirectUri);

  if (!clientId) {
    console.error('❌ 카카오 Client ID가 설정되지 않았습니다!');
    return null;
  }

  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  try {
    // 웹 환경에서는 팝업 사용
    if (isWeb) {
      return await webKakaoOAuth(authUrl, clientId, redirectUri);
    }

    // 모바일 환경에서는 기존 방식 사용
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== 'success' || !result.url) {
      return null;
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) return null;

    // Exchange authorization code for access token
    const tokenResp = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });

    if (!tokenResp.ok) {
      console.error('Kakao token exchange failed', await tokenResp.text());
      return null;
    }
    const tokenJson = await tokenResp.json();
    return tokenJson.access_token as string;
  } catch (e) {
    console.error('Kakao OAuth error', e);
    return null;
  }
}


