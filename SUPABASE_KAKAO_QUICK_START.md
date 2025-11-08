# Supabase 카카오 로그인 빠른 시작 가이드

## 📋 필요한 정보 정리

### 1. Supabase에서 가져올 정보
1. **Supabase Dashboard** 접속
2. **Settings > API** 메뉴
3. 다음 정보 복사:
   - ✅ **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - ✅ **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ **Redirect URI** 확인 (Authentication > URL Configuration)

### 2. Kakao Developers에서 가져올 정보
1. **Kakao Developers** 접속: https://developers.kakao.com/
2. 내 애플리케이션 선택
3. **앱 키** 메뉴:
   - ✅ **REST API 키** → Supabase에 입력
4. **제품 설정 > 카카오 로그인 > 보안**:
   - ✅ **Client Secret** → Supabase에 입력

## 🔧 Supabase Dashboard 설정 (단계별)

### Step 1: 카카오 제공자 활성화
1. Supabase Dashboard > **Authentication** > **Providers**
2. **Kakao** 찾기
3. **Enable Kakao** 토글 켜기

### Step 2: 카카오 앱 정보 입력
다음 필드에 입력:

| 필드 | 값 (Kakao Developers에서 가져오기) |
|------|-----------------------------------|
| **Client ID (REST API Key)** | REST API 키 |
| **Client Secret** | Client Secret |
| **Redirect URL** | 자동 생성됨 (아래 참고) |

### Step 3: Redirect URI 확인 및 등록
1. Supabase Dashboard > **Authentication** > **URL Configuration**
2. **Redirect URLs** 섹션에서 확인:
   ```
   https://[프로젝트-참조].supabase.co/auth/v1/callback
   ```
   예: `https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback`

3. **Kakao Developers**에 이 Redirect URI 등록:
   - Kakao Developers > 내 애플리케이션
   - **제품 설정 > 카카오 로그인 > Redirect URI 등록**
   - **+ 추가** 클릭
   - Supabase Redirect URI 붙여넣기
   - **저장**

## 📱 프론트엔드 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**중요**: `EXPO_PUBLIC_` 접두사가 필요합니다!

## 📦 의존성 설치

```bash
npm install @supabase/supabase-js
```

## ✅ 설정 완료 체크리스트

- [ ] Supabase Dashboard에서 Kakao 제공자 활성화
- [ ] Supabase에 REST API Key 입력
- [ ] Supabase에 Client Secret 입력
- [ ] Kakao Developers에 Supabase Redirect URI 등록
- [ ] 프론트엔드 `.env` 파일에 Supabase URL과 Key 설정
- [ ] `npm install` 실행

## 🧪 테스트

1. 앱 실행: `npm start`
2. 로그인 화면에서 "카카오로 시작하기" 클릭
3. 카카오 로그인 웹뷰 열림
4. 카카오 계정으로 로그인
5. 앱으로 자동 리다이렉트 및 로그인 완료

## ⚠️ 주의사항

1. **Redirect URI 정확히 일치**: 
   - Supabase: `https://[project].supabase.co/auth/v1/callback`
   - Kakao Developers에 정확히 동일하게 등록

2. **환경 변수 접두사**:
   - `EXPO_PUBLIC_` 접두사 필수
   - 재시작 후 적용

3. **프로덕션 배포 시**:
   - `app.json`의 `associatedDomains`를 실제 Supabase 도메인으로 변경
   - Site URL도 실제 도메인으로 설정

## 🔍 문제 해결

### "Invalid redirect URI"
- Kakao Developers의 Redirect URI와 Supabase의 Redirect URI가 정확히 일치하는지 확인
- 대소문자, 슬래시까지 모두 일치해야 함

### "Client ID or Secret is incorrect"
- REST API Key와 Client Secret이 정확한지 확인
- 공백이 포함되지 않았는지 확인

### 환경 변수가 적용되지 않음
- `EXPO_PUBLIC_` 접두사 확인
- 앱 재시작 필요

