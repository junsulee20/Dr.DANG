import * as WebBrowser from 'expo-web-browser';
import { API_ENDPOINTS } from '@/constants/api';

// WebBrowser 완료 후 자동으로 닫히도록 설정
WebBrowser.maybeCompleteAuthSession();

/**
 * 카카오 로그인을 위한 웹 브라우저 열기
 * 카카오 Developers에서 설정한 Redirect URI로 리다이렉트됩니다.
 */
export async function openKakaoLogin(): Promise<string | null> {
  // 카카오 로그인 URL 생성
  // 환경 변수에서 카카오 앱 키 가져오기
  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
  
  if (!KAKAO_CLIENT_ID) {
    throw new Error('카카오 클라이언트 ID가 설정되지 않았습니다. EXPO_PUBLIC_KAKAO_CLIENT_ID 환경 변수를 확인하세요.');
  }
  
  const REDIRECT_URI = 'drdang://auth/kakao'; // 앱 스킴 사용 (app.json의 scheme과 일치)
  
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      kakaoAuthUrl,
      REDIRECT_URI
    );

    if (result.type === 'success' && result.url) {
      // URL에서 authorization code 추출
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      return code;
    }

    return null;
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    return null;
  }
}

/**
 * 카카오 authorization code를 access token으로 교환
 */
export async function exchangeCodeForToken(code: string): Promise<string | null> {
  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
  
  if (!KAKAO_CLIENT_ID) {
    throw new Error('카카오 클라이언트 ID가 설정되지 않았습니다.');
  }
  
  const REDIRECT_URI = 'drdang://auth/kakao';

  try {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error('토큰 교환 실패');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('토큰 교환 오류:', error);
    return null;
  }
}

/**
 * 카카오 로그인 전체 프로세스
 */
export async function performKakaoLogin(): Promise<string | null> {
  try {
    // 1. 카카오 로그인 페이지 열기
    const code = await openKakaoLogin();
    if (!code) {
      return null;
    }

    // 2. authorization code를 access token으로 교환
    const accessToken = await exchangeCodeForToken(code);
    return accessToken;
  } catch (error) {
    console.error('카카오 로그인 프로세스 오류:', error);
    return null;
  }
}

