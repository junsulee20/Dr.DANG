# Supabase Edge Functions 마이그레이션 가이드

## ✅ Supabase Edge Functions의 장점

1. **별도 서버 배포 불필요** - Supabase에 통합
2. **외부 API 호출 지원** - OpenAI, 카카오 등
3. **보안** - API 키를 Edge Functions에서 안전하게 관리
4. **글로벌 배포** - 자동으로 CDN 배포
5. **비용 효율** - 사용한 만큼만 과금

---

## 🚀 Step 1: Supabase CLI 설치 및 설정

### 1.1 Supabase CLI 설치

```bash
# npm으로 설치
npm install -g supabase

# 또는 Homebrew (Mac)
brew install supabase/tap/supabase
```

### 1.2 Supabase 로그인

```bash
supabase login
```

브라우저가 열리면 Supabase 계정으로 로그인하세요.

### 1.3 프로젝트 초기화

```bash
# 프로젝트 루트에서 실행
supabase init
```

이 명령은 `supabase/` 폴더를 생성합니다.

---

## 📁 Step 2: Edge Functions 구조 생성

현재 Express.js 라우트를 Edge Functions로 변환합니다:

```
supabase/
  functions/
    auth-kakao/
      index.ts          # 카카오 로그인
    food-analyze/
      index.ts          # 음식 분석
    records/
      index.ts          # 식단 기록 CRUD
    user-profile/
      index.ts          # 사용자 프로필
```

### 2.1 Edge Functions 생성

```bash
cd supabase/functions

# 각 함수 생성
supabase functions new auth-kakao
supabase functions new food-analyze
supabase functions new records
supabase functions new user-profile
```

---

## 📝 Step 3: Edge Functions 구현 예시

### 3.1 카카오 로그인 함수 (`auth-kakao/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { kakaoAccessToken } = await req.json()

    if (!kakaoAccessToken) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'kakaoAccessToken이 필요합니다.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. 카카오 사용자 정보 조회
    const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    })

    if (!kakaoResponse.ok) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '유효하지 않은 카카오 액세스 토큰입니다.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const kakaoUser = await kakaoResponse.json()
    const kakaoId = kakaoUser.id.toString()
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@drdang.app`
    const nickname = kakaoUser.kakao_account?.profile?.nickname || kakaoUser.properties?.nickname || '사용자'

    // 2. Supabase 클라이언트 생성 (Service Role Key 사용)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 3. 사용자 찾기 또는 생성
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('kakao_id', kakaoId)
      .limit(1)

    let user
    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0]
    } else {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          kakao_id: kakaoId,
          email,
          name: nickname,
        })
        .select()
        .single()

      if (insertError) throw insertError
      user = newUser
    }

    // 4. JWT 토큰 생성 (또는 Supabase Auth 사용)
    // JWT 생성 로직은 별도 함수로 분리 가능

    return new Response(
      JSON.stringify({
        accessToken: 'jwt_token_here', // JWT 생성 로직 필요
        refreshToken: 'refresh_token_here',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3.2 음식 분석 함수 (`food-analyze/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import OpenAI from 'https://deno.land/x/openai@v4.20.0/mod.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 인증 확인
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // FormData에서 이미지 추출
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: '이미지 파일이 필요합니다.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 이미지를 base64로 변환
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const imageBase64 = `data:${imageFile.type};base64,${base64}`

    // OpenAI API 호출
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // 음식 분석 로직 (기존 analyzeFood 함수와 동일)
    // ... 분석 로직 ...

    // Supabase Storage에 이미지 업로드
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `${userId}/${Date.now()}_${imageFile.name}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('food-images')
      .upload(fileName, arrayBuffer, {
        contentType: imageFile.type,
      })

    if (uploadError) throw uploadError

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3.3 공유 CORS 헤더 (`_shared/cors.ts`)

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## 🔐 Step 4: 환경 변수 설정

### 4.1 Supabase Dashboard에서 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Settings** → **Edge Functions** → **Secrets**
4. 다음 환경 변수 추가:

```
OPENAI_API_KEY=your_openai_api_key
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
JWT_SECRET=your_jwt_secret
```

**참고:** `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 자동으로 제공됩니다.

---

## 🚀 Step 5: Edge Functions 배포

### 5.1 로컬 테스트

```bash
# Supabase 로컬 개발 환경 시작 (선택사항)
supabase start

# 함수 로컬 테스트
supabase functions serve auth-kakao
```

### 5.2 프로덕션 배포

```bash
# 모든 함수 배포
supabase functions deploy

# 특정 함수만 배포
supabase functions deploy auth-kakao
supabase functions deploy food-analyze
supabase functions deploy records
supabase functions deploy user-profile
```

배포 후 URL 형식:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/auth-kakao
https://YOUR_PROJECT_REF.supabase.co/functions/v1/food-analyze
https://YOUR_PROJECT_REF.supabase.co/functions/v1/records
https://YOUR_PROJECT_REF.supabase.co/functions/v1/user-profile
```

---

## 📱 Step 6: 프론트엔드 설정 업데이트

### 6.1 `app.config.js` 업데이트

```javascript
extra: {
  // ...
  apiUrl: process.env.SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  // ...
}
```

### 6.2 `lib/api.ts` 업데이트

Edge Functions URL로 변경:

```typescript
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
const API_BASE_URL = `${SUPABASE_URL}/functions/v1`;

// 예시: 카카오 로그인
export async function kakaoLogin(kakaoAccessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth-kakao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // Edge Functions 인증
    },
    body: JSON.stringify({ kakaoAccessToken }),
  });
  return response.json();
}
```

---

## ✅ 장점 요약

1. ✅ **별도 서버 배포 불필요** - Supabase에 통합
2. ✅ **외부 API 호출 가능** - OpenAI, 카카오 등
3. ✅ **보안** - API 키 안전하게 관리
4. ✅ **자동 스케일링** - 트래픽에 따라 자동 확장
5. ✅ **글로벌 CDN** - 전 세계 낮은 지연시간

---

## 📚 참고 자료

- [Supabase Edge Functions 공식 문서](https://supabase.com/docs/guides/functions)
- [Deno 런타임 문서](https://deno.land/manual)
- [Supabase CLI 문서](https://supabase.com/docs/reference/cli)

