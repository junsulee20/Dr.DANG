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
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/logo.png', // 임시로 logo.png 사용
        // backgroundImage과 monochromeImage는 선택사항이므로 제거
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
      // 환경 변수에서 읽거나 기본값 사용
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zhntmviycucdvupiccoa.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnRtdml5Y3VjZHZ1cGljY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDk3OTIsImV4cCI6MjA3NzcyNTc5Mn0.Ui1FeI3nAZ4mDuUPcFWjUpqMfShk-w1Vd4JbDQQUqjI',
    },
    owner: 'drdang',
  },
};

