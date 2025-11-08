# 프론트엔드 환경 변수 설정 완료 가이드

## ✅ 현재 설정된 Redirect URI

```
https://zhntmviycucdvupiccoa.supabase.co/auth/v1/callback
```

이 URI는 Supabase에서 자동 생성된 표준 Redirect URI입니다.

## 📝 1단계: .env 파일 생성

프로젝트 루트 디렉토리(`/home/sean/next/drdang/Dr.DANG/`)에 `.env` 파일을 생성하세요:

```bash
cd /home/sean/next/drdang/Dr.DANG
touch .env
```

## 📝 2단계: 환경 변수 입력

`.env` 파일에 다음 내용을 입력하세요:

```env
# Supabase 설정
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 백엔드 API URL (선택사항)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Supabase 값 가져오기

1. **Supabase Dashboard** 접속
2. **Settings > API** 메뉴
3. 다음 값 복사:
   - **Project URL**: `https://zhntmviycucdvupiccoa.supabase.co` (이미 알고 있음)
   - **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`에 입력

### 예시 .env 파일

```env
EXPO_PUBLIC_SUPABASE_URL=https://zhntmviycucdvupiccoa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnRtdml5Y3VjZHZ1cGljY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDk3OTIsImV4cCI6MjA3NzcyNTc5Mn0.Ui1FeI3nAZ4mDuUPcFWjUpqMfShk-w1Vd4JbDQQUqjI
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## 📝 3단계: Supabase Dashboard Site URL 설정

**중요**: Supabase Dashboard에서 Site URL을 설정해야 앱으로 리다이렉트됩니다.

1. **Supabase Dashboard** 접속
2. **Authentication > URL Configuration** 메뉴
3. **Site URL** 설정:
   ```
   drdang://
   ```
   또는 개발용:
   ```
   exp://localhost:8081
   ```

4. **Redirect URLs**에 다음 추가 (이미 있을 수 있음):
   ```
   drdang://auth/callback
   exp://localhost:8081/--/auth/callback
   ```

## 📝 4단계: 앱 재시작

환경 변수를 변경한 후에는 **반드시 앱을 재시작**해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 캐시 클리어하며 재시작
npx expo start -c
```

## ✅ 설정 확인 체크리스트

- [ ] `.env` 파일 생성 (프로젝트 루트)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` 설정
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] Supabase Dashboard > Authentication > URL Configuration에서 Site URL 설정
- [ ] Kakao Developers에 Redirect URI 등록 확인
- [ ] 앱 재시작 (`npx expo start -c`)

## 🧪 테스트

1. 앱 실행: `npm start`
2. 로그인 화면에서 "카카오로 시작하기" 클릭
3. 카카오 로그인 웹뷰 열림
4. 카카오 계정으로 로그인
5. Supabase Redirect URI로 리다이렉트
6. 앱으로 자동 리다이렉트 및 로그인 완료

## 🔍 환경 변수 확인

앱 실행 후 콘솔에서 확인:

```typescript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정 안됨');
```

## ⚠️ 주의사항

1. **EXPO_PUBLIC_ 접두사 필수**: 클라이언트에서 접근하려면 반드시 필요
2. **앱 재시작 필수**: 환경 변수 변경 후 반드시 재시작
3. **.gitignore 확인**: `.env` 파일이 Git에 커밋되지 않도록 확인

## 📚 관련 파일

- `FRONTEND_ENV_SETUP.md` - 상세 환경 변수 설정 가이드
- `SUPABASE_REDIRECT_SETUP.md` - Redirect URI 설정 가이드
- `SUPABASE_KAKAO_QUICK_START.md` - 카카오 로그인 빠른 시작

