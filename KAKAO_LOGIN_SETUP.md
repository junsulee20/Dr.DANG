# 카카오 로그인 설정 가이드

## 1. Kakao Developers 설정

### 1.1 앱 등록
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > **애플리케이션 추가하기** 클릭
3. 앱 이름, 사업자명 입력 후 생성

### 1.2 플랫폼 등록
1. 앱 설정 > **플랫폼** 메뉴
2. **Web 플랫폼 등록** 클릭
   - 사이트 도메인: `http://localhost:3001` (개발용)
   - 또는 실제 도메인 (프로덕션용)
3. **Android 플랫폼 등록** (필요한 경우)
   - 패키지명: `com.drdang.app` (app.json의 package와 일치)
4. **iOS 플랫폼 등록** (필요한 경우)
   - 번들 ID: `com.drdang.app` (app.json의 bundleIdentifier와 일치)

### 1.3 카카오 로그인 활성화
1. 제품 설정 > **카카오 로그인** 활성화
2. **Redirect URI** 등록:
   - `drdang://auth/kakao` (앱 스킴)
   - `http://localhost:3001/auth/kakao/callback` (웹용, 선택사항)

### 1.4 동의 항목 설정
1. 제품 설정 > 카카오 로그인 > **동의항목**
2. 필수 동의 항목:
   - 닉네임
   - 프로필 사진
3. 선택 동의 항목:
   - 이메일 (필요한 경우)

### 1.5 앱 키 확인
1. 앱 설정 > **앱 키** 메뉴
2. **REST API 키** 복사 → 환경 변수에 설정

## 2. 환경 변수 설정

### 2.1 프론트엔드 (.env 또는 app.config.js)
프로젝트 루트에 `.env` 파일 생성 또는 `app.config.js`에 추가:

```env
EXPO_PUBLIC_KAKAO_CLIENT_ID=your_rest_api_key_here
```

또는 `app.config.js`:
```javascript
export default {
  expo: {
    extra: {
      kakaoClientId: process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID,
    },
  },
};
```

### 2.2 백엔드 (server/.env)
이미 설정되어 있어야 합니다:
```env
KAKAO_CLIENT_ID=your_rest_api_key_here
KAKAO_CLIENT_SECRET=your_client_secret_here
KAKAO_REDIRECT_URI=drdang://auth/kakao
```

## 3. 앱 스킴 설정 확인

`app.json`에 이미 설정되어 있습니다:
```json
{
  "expo": {
    "scheme": "drdang"
  }
}
```

이 설정으로 `drdang://` 스킴이 앱을 열 수 있습니다.

## 4. 의존성 설치

프론트엔드에서 다음 패키지 설치:
```bash
npm install @react-native-async-storage/async-storage
```

이미 `package.json`에 추가되어 있으므로:
```bash
npm install
```

## 5. 테스트

### 5.1 개발 서버 실행
```bash
# 프론트엔드
npm start

# 백엔드 (별도 터미널)
cd server
npm run dev
```

### 5.2 로그인 테스트
1. 앱 실행
2. 로그인 화면에서 "카카오로 시작하기" 버튼 클릭
3. 카카오 로그인 웹뷰가 열림
4. 카카오 계정으로 로그인
5. 앱으로 리다이렉트되어 자동 로그인 완료

## 6. 문제 해결

### 문제: Redirect URI가 일치하지 않음
- Kakao Developers에서 등록한 Redirect URI와 코드의 URI가 정확히 일치해야 합니다
- `drdang://auth/kakao` (앱 스킴)
- 대소문자 구분 주의

### 문제: 앱이 열리지 않음
- `app.json`의 `scheme`이 `drdang`으로 설정되어 있는지 확인
- 앱을 재빌드해야 할 수 있습니다

### 문제: 토큰 교환 실패
- REST API 키가 올바른지 확인
- Redirect URI가 정확히 일치하는지 확인

## 7. 프로덕션 배포 시 주의사항

1. **앱 스킴**: 프로덕션 앱의 실제 패키지명/번들 ID 사용
2. **Redirect URI**: 프로덕션 환경에 맞게 수정
3. **도메인**: 실제 백엔드 서버 도메인으로 변경
4. **보안**: Client Secret은 절대 클라이언트에 노출하지 않기

