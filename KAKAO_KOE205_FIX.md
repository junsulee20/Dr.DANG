# KOE205 에러 빠른 해결 가이드

## 🔴 문제: KOE205 에러
"잘못된 요청 (KOE205) - 서비스 설정에 오류가 있어, 이용할 수 없습니다."

## ✅ 해결 방법 (순서대로)

### 1단계: Kakao Developers 콘솔 확인

#### 1.1 Redirect URI 확인 및 등록
1. **Kakao Developers** 접속: https://developers.kakao.com/
2. 내 애플리케이션 선택
3. **제품 설정** > **카카오 로그인** > **Redirect URI 등록**
4. 다음 URI를 **정확히** 추가:
   ```
   https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback
   ```
   ⚠️ **주의**: 
   - http와 https 구분
   - 마지막에 `/` 없는지 확인
   - 오타 없이 정확히 입력

#### 1.2 동의 항목 설정
1. **제품 설정** > **카카오 로그인** > **동의항목** 이동
2. **선택 동의** 항목만 설정:
   - ✅ **닉네임** (필수 아님, 선택 동의로 설정)
   - ❌ 이메일 - 비활성화 또는 선택 동의
   - ❌ 프로필 사진 - 비활성화 또는 선택 동의

#### 1.3 카카오 로그인 활성화
1. **제품 설정** > **카카오 로그인** > **활성화 설정**
2. **카카오 로그인** 토글 **켜기**
3. 저장

### 2단계: Supabase Dashboard 설정

#### 2.1 카카오 Provider 활성화
1. **Supabase Dashboard** 접속
2. **Authentication** > **Providers** 이동
3. **Kakao** 제공자 찾기
4. **Enable Kakao** 토글 **켜기**

#### 2.2 카카오 앱 정보 입력
- **Client ID (REST API Key)**: 
  - Kakao Developers > 내 애플리케이션 > 앱 키
  - **REST API 키** 복사하여 입력

- **Client Secret**: 
  - Kakao Developers > 제품 설정 > 카카오 로그인 > 보안
  - **Client Secret** 복사하여 입력
  - 없으면 "Client Secret 코드" 버튼 클릭하여 생성

#### 2.3 Redirect URI 확인
1. **Authentication** > **URL Configuration** 이동
2. **Redirect URLs** 확인:
   - `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`
   - 이 URI가 Kakao Developers에 등록되어 있어야 함

### 3단계: 설정 저장 및 테스트

#### 3.1 설정 저장
- Supabase Dashboard에서 모든 설정 저장
- Kakao Developers에서 모든 설정 저장

#### 3.2 잠시 대기
- 설정 변경 후 1-2분 정도 대기 (적용 시간)

#### 3.3 테스트
1. 앱에서 카카오 로그인 버튼 클릭
2. 카카오 로그인 화면이 정상적으로 열리는지 확인
3. 로그인 완료 확인

## 🔍 문제 해결 체크리스트

### Redirect URI 확인
- [ ] Kakao Developers에 Redirect URI 등록됨
- [ ] URI가 정확히 일치함 (대소문자, 슬래시 등)
- [ ] Supabase Redirect URI와 동일함

### 카카오 앱 설정
- [ ] 카카오 로그인 활성화됨
- [ ] REST API 키 확인됨
- [ ] Client Secret 설정됨
- [ ] 동의 항목 설정 완료 (닉네임만)

### Supabase 설정
- [ ] 카카오 Provider 활성화됨
- [ ] Client ID (REST API Key) 입력됨
- [ ] Client Secret 입력됨
- [ ] Redirect URI 확인됨

## 💡 추가 팁

### 동의 항목 최소화
- **닉네임만** 선택 동의로 설정
- 이메일, 프로필 사진은 비활성화
- 코드에서도 email, profile_image를 optional로 처리했으므로 문제없음

### 에러 로그 확인
- Supabase Dashboard > Logs에서 에러 확인
- 브라우저 개발자 도구(F12) > Console에서 에러 확인
- 백엔드 서버 로그 확인

### 캐시 클리어
설정 변경 후에도 에러가 발생하면:
1. 브라우저 캐시 클리어
2. Supabase Dashboard에서 설정 재확인
3. Kakao Developers에서 설정 재확인

## ⚠️ 주의사항

1. **Redirect URI는 정확히 일치해야 함**
   - 대소문자 구분
   - 마지막 슬래시(/) 주의
   - http/https 구분

2. **Client Secret은 안전하게 보관**
   - Git에 커밋하지 않기
   - 환경 변수로 관리

3. **설정 변경 후 대기 시간**
   - 설정 변경 후 즉시 반영되지 않을 수 있음
   - 1-2분 정도 대기 후 테스트

## 📝 SQL 스키마 수정 필요 여부

**답: 수정 불필요합니다.**

현재 스키마는 이미 optional 필드를 지원하므로 수정할 필요가 없습니다:
- `email VARCHAR(255)` - NULL 허용 ✅
- `nickname VARCHAR(255)` - NULL 허용 ✅
- `profile_image TEXT` - NULL 허용 ✅

코드에서도 optional로 처리했으므로 SQL Editor에서 수정할 필요가 없습니다.

## 🚀 빠른 해결 순서

1. **Kakao Developers**에서 Redirect URI 등록
2. **Supabase Dashboard**에서 카카오 Provider 설정
3. **동의 항목**을 닉네임만 설정
4. **설정 저장** 후 1-2분 대기
5. **테스트**

이 순서대로 하면 KOE205 에러가 해결됩니다!

