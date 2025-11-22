import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
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
  
  // 모바일에서는 백엔드 콜백 URL 사용
  // 백엔드에 /auth/kakao/callback 엔드포인트가 추가되었습니다
  const apiUrl = 
    (Constants.expoConfig?.extra as any)?.apiUrl || 
    'http://127.0.0.1:3001';
  const backendCallbackUrl = apiUrl.replace(/\/$/, '') + '/auth/kakao/callback';
  
  const redirectUri = isWeb 
    ? window.location.origin + '/auth/kakao/callback'
    : (process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || backendCallbackUrl);

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

    // 모바일 환경에서는 openAuthSessionAsync 사용
    // redirectUri와 일치하는 URL로 리다이렉트되면 자동으로 앱으로 돌아옵니다
    // Universal Link 설정 없이도 작동합니다!
    console.log('🔵 모바일 카카오 OAuth 시작...');
    console.log('🔵 Auth URL:', authUrl);
    console.log('🔵 Redirect URI:', redirectUri);
    
    // 타임아웃 추가 (60초)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('카카오 로그인 타임아웃: 웹뷰가 응답하지 않습니다. 백엔드 서버 연결을 확인해주세요.'));
      }, 60000);
    });
    
    console.log('🔵 WebBrowser.openAuthSessionAsync 호출 중...');
    const authPromise = WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    const result = await Promise.race([authPromise, timeoutPromise]);
    
    console.log('🔵 WebBrowser 결과:', JSON.stringify(result, null, 2));
    
    if (result.type === 'cancel') {
      console.error('❌ 사용자가 로그인을 취소했습니다.');
      return null;
    }
    
    if (result.type === 'dismiss') {
      console.error('❌ 로그인 창이 닫혔습니다.');
      return null;
    }
    
    if (result.type !== 'success') {
      console.error('❌ 예상치 못한 결과 타입:', result.type);
      return null;
    }
    
    if (!result.url) {
      console.error('❌ 리다이렉트 URL이 없습니다.');
      return null;
    }
    
    console.log('🔵 리다이렉트 URL:', result.url);
    
    let url: URL;
    try {
      url = new URL(result.url);
    } catch (e) {
      console.error('❌ URL 파싱 실패:', result.url, e);
      return null;
    }
    
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      console.error('❌ 카카오 인증 오류:', error);
      return null;
    }
    
    if (!code) {
      console.error('❌ Authorization code가 없습니다. URL:', result.url);
      return null;
    }
    
    console.log('✅ Authorization code 받음:', code.substring(0, 20) + '...');

    // Exchange authorization code for access token
    console.log('🔵 카카오 토큰 교환 중...');
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
      const errorText = await tokenResp.text();
      console.error('❌ 카카오 토큰 교환 실패:', errorText);
      console.error('❌ Status:', tokenResp.status);
      return null;
    }
    
    const tokenJson = await tokenResp.json();
    console.log('✅ Access Token 받음:', tokenJson.access_token ? tokenJson.access_token.substring(0, 20) + '...' : '없음');
    return tokenJson.access_token as string;
  } catch (e: any) {
    console.error('❌ Kakao OAuth 에러 발생!');
    console.error('❌ 에러 타입:', e?.name);
    console.error('❌ 에러 메시지:', e?.message);
    console.error('❌ 전체 에러:', e);
    return null;
  }
}


