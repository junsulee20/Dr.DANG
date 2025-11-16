require('dotenv').config();

module.exports = {
  expo: {
    name: 'Dr.DANG',
    slug: 'drdang',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png', // 임시로 logo.png 사용 (나중에 최적화된 icon.png로 교체 필요)
    scheme: 'drdang',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.drdang.app', // iOS Bundle ID (카카오 콘솔에도 동일하게 등록)
      supportsTablet: true,
    },
    android: {
      package: 'com.drdang.app', // 앱 패키지명 (카카오 콘솔에도 동일하게 등록)
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/logo.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/logo.png', // 임시로 logo.png 사용
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/logo.png', // 임시로 logo.png 사용
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'b3bcabcc-3ab5-4a9e-aa92-b3c9437e83f2',
      },
      openaiApiKey: process.env.OPENAI_API_KEY,
      // localhost 대신 127.0.0.1 사용 (IPv6 문제 방지)
      apiUrl: process.env.API_URL || 'http://127.0.0.1:3001',
      kakaoClientId: process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID,
      kakaoRedirectUri: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || 'drdang://auth/kakao',
    },
    owner: 'drdang',
  },
};

