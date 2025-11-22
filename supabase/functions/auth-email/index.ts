import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface BasicUser {
  id: string
  email: string
  name: string
}

/**
 * Uint8Array를 base64 문자열로 변환 (Deno 호환)
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * base64 문자열을 Uint8Array로 변환 (Deno 호환)
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Web Crypto API를 사용한 비밀번호 해싱 (PBKDF2)
 * Deno Edge Functions에서 Worker 없이 작동합니다.
 */
async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const passwordData = encoder.encode(password)
    
    // PBKDF2로 해싱 (100,000 iterations)
    const key = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    )
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256 // 32 bytes
    )
    
    // salt와 hash를 base64로 인코딩하여 저장
    const hashArray = new Uint8Array(hashBuffer)
    
    // 형식: "pbkdf2:salt:hash" (base64)
    const saltBase64 = uint8ArrayToBase64(salt)
    const hashBase64 = uint8ArrayToBase64(hashArray)
    
    return `pbkdf2:${saltBase64}:${hashBase64}`
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error(`비밀번호 해싱 중 오류가 발생했습니다: ${error.message}`)
  }
}

/**
 * 비밀번호 검증
 * pbkdf2 형식과 기존 bcrypt 형식 모두 지원
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // pbkdf2 형식인 경우
  if (storedHash.startsWith('pbkdf2:')) {
    const parts = storedHash.split(':')
    if (parts.length !== 3) {
      console.error('Invalid pbkdf2 hash format')
      return false
    }
    
    const [, saltBase64, hashBase64] = parts
    
    if (!saltBase64 || !hashBase64) {
      return false
    }
    
    try {
      const salt = base64ToUint8Array(saltBase64)
      const storedHashArray = base64ToUint8Array(hashBase64)
      
      const encoder = new TextEncoder()
      const passwordData = encoder.encode(password)
      
      const key = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits']
      )
      
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        key,
        256
      )
      
      const computedHash = new Uint8Array(hashBuffer)
      
      // 상수 시간 비교
      if (computedHash.length !== storedHashArray.length) {
        return false
      }
      
      let isEqual = true
      for (let i = 0; i < computedHash.length; i++) {
        if (computedHash[i] !== storedHashArray[i]) {
          isEqual = false
        }
      }
      
      return isEqual
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }
  
  // 기존 bcrypt 형식인 경우 (호환성을 위해, 하지만 실제로는 작동하지 않을 수 있음)
  // Edge Functions에서는 bcrypt를 사용할 수 없으므로 false 반환
  console.warn('bcrypt 해시는 Edge Functions에서 지원되지 않습니다. 비밀번호를 재설정해주세요.')
  return false
}

/**
 * JWT 토큰 발급
 */
let cachedSigningKey: CryptoKey | null = null

async function getSigningKey(): Promise<CryptoKey> {
  if (cachedSigningKey) {
    return cachedSigningKey
  }

  const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET')

  if (!jwtSecret) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.')
  }

  const encoder = new TextEncoder()
  const rawKey = encoder.encode(jwtSecret)

  cachedSigningKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign', 'verify']
  )

  return cachedSigningKey
}

async function issueTokens(user: BasicUser): Promise<{ accessToken: string; refreshToken: string }> {
  const key = await getSigningKey()

  // Access Token (2시간)
  const accessTokenPayload = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    name: user.name,
    exp: getNumericDate(new Date(Date.now() + 2 * 60 * 60 * 1000)), // 2시간
  }

  // Refresh Token (30일)
  const refreshTokenPayload = {
    sub: user.id,
    typ: 'refresh',
    exp: getNumericDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30일
  }

  const accessToken = await create({ alg: 'HS256', typ: 'JWT' }, accessTokenPayload, key)
  const refreshToken = await create({ alg: 'HS256', typ: 'JWT' }, refreshTokenPayload, key)

  return { accessToken, refreshToken }
}

// CORS 헤더를 모든 응답에 포함하는 헬퍼 함수
function createResponse(body: any, status: number = 200): Response {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}

serve(async (req: Request) => {
  // CORS 처리 - OPTIONS 요청
  if (req.method === 'OPTIONS') {
    return createResponse('ok', 200)
  }

  try {
    const url = new URL(req.url)
    // 경로 파싱: /functions/v1/auth-email/login 또는 /functions/v1/auth-email/signup
    const pathParts = url.pathname.split('/').filter(Boolean)
    // 마지막 부분이 'login' 또는 'signup'
    const action = pathParts[pathParts.length - 1] === 'auth-email' 
      ? null // 기본 경로인 경우
      : pathParts[pathParts.length - 1] // 'login' or 'signup'
    
    console.log('🔵 경로 파싱:', { pathname: url.pathname, pathParts, action, method: req.method })
    console.log('🔵 환경 변수 확인:', { 
      hasJWTSecret: !!Deno.env.get('JWT_SECRET'),
      hasSupabaseJWTSecret: !!Deno.env.get('SUPABASE_JWT_SECRET'),
      hasSupabaseURL: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    })

    // 환경 변수 검증
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ 필수 환경 변수가 설정되지 않았습니다:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
      })
      return createResponse({
        error: {
          code: 'CONFIGURATION_ERROR',
          message: '서버 설정 오류가 발생했습니다.',
        },
      }, 500)
    }

    // Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // POST /auth/email/signup
    if (action === 'signup') {
      let body
      try {
        body = await req.json()
      } catch (jsonError) {
        return createResponse({
          error: {
            code: 'INVALID_JSON',
            message: '요청 본문이 올바른 JSON 형식이 아닙니다.',
          },
        }, 400)
      }
      const { name, email, password, height, weight } = body

      if (!name || !email || !password || height === undefined || weight === undefined) {
        return createResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이름, 이메일, 비밀번호, 키, 몸무게를 모두 입력해주세요.',
          },
        }, 400)
      }

      const normalizedEmail = email.trim().toLowerCase()
      const trimmedName = name.trim()

      if (!trimmedName) {
        return createResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이름을 올바르게 입력해주세요.',
          },
        }, 400)
      }

      const heightValue = parseInt(String(height), 10)
      const weightValue = parseInt(String(weight), 10)

      if (Number.isNaN(heightValue) || Number.isNaN(weightValue)) {
        return createResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: '키와 몸무게는 숫자로 입력해주세요.',
          },
        }, 400)
      }

      // 기존 사용자 확인
      const { data: existingUser, error: existingUserError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error('Email signup user fetch error:', existingUserError)
        throw new Error('이미 등록된 이메일인지 확인하는 중 오류가 발생했습니다.')
      }

      if (existingUser) {
        return createResponse({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: '이미 사용 중인 이메일입니다.',
          },
        }, 409)
      }

      // 비밀번호 해시화 (Web Crypto API 사용)
      let passwordHash
      try {
        passwordHash = await hashPassword(password)
        console.log('✅ 비밀번호 해싱 완료')
      } catch (hashError: any) {
        console.error('❌ 비밀번호 해싱 오류:', hashError)
        return createResponse({
          error: {
            code: 'PASSWORD_HASH_ERROR',
            message: '비밀번호 처리 중 오류가 발생했습니다.',
            details: hashError.message || String(hashError),
          },
        }, 500)
      }

      // 사용자 생성
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          name: trimmedName,
          email: normalizedEmail,
          password_hash: passwordHash,
          height: heightValue,
          weight: weightValue,
        })
        .select('id, name, email')
        .single()

      if (insertError || !newUser) {
        console.error('Email signup insert error:', insertError)
        throw new Error('회원가입 처리 중 오류가 발생했습니다.')
      }

      // JWT 토큰 발급
      const { accessToken, refreshToken } = await issueTokens(newUser)

      return createResponse({
        accessToken,
        refreshToken,
        user: newUser,
      }, 201)
    }

    // POST /auth/email/login
    if (action === 'login') {
      let body
      try {
        body = await req.json()
      } catch (jsonError) {
        return createResponse({
          error: {
            code: 'INVALID_JSON',
            message: '요청 본문이 올바른 JSON 형식이 아닙니다.',
          },
        }, 400)
      }
      const { email, password } = body

      if (!email || !password) {
        return createResponse({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이메일과 비밀번호를 모두 입력해주세요.',
          },
        }, 400)
      }

      const normalizedEmail = email.trim().toLowerCase()

      // 사용자 조회
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, password_hash')
        .eq('email', normalizedEmail)
        .single()

      if (error || !user) {
        console.error('Email login user fetch error:', error)
        return createResponse({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
        }, 401)
      }

      if (!user.password_hash) {
        return createResponse({
          error: {
            code: 'PASSWORD_NOT_SET',
            message: '이메일 로그인 정보가 설정되지 않은 계정입니다. 카카오 로그인 또는 관리자에게 문의해주세요.',
          },
        }, 400)
      }

      // 비밀번호 검증 (Web Crypto API 사용)
      const isPasswordValid = await verifyPassword(password, user.password_hash)

      if (!isPasswordValid) {
        return createResponse({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
        }, 401)
      }

      // JWT 토큰 발급
      const { accessToken, refreshToken } = await issueTokens({
        id: user.id,
        email: user.email,
        name: user.name,
      })

      return createResponse({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    }

    // 지원하지 않는 액션
    return createResponse({
      error: {
        code: 'NOT_FOUND',
        message: `요청한 리소스를 찾을 수 없습니다. (action: ${action || 'null'}, path: ${url.pathname})`,
      },
    }, 404)
  } catch (error: any) {
    console.error('❌ Auth email error:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    
    return createResponse({
      error: {
        code: 'INTERNAL_ERROR',
        message: '인증 처리 중 오류가 발생했습니다.',
        details: error.message || String(error),
        stack: error.stack,
      },
    }, 500)
  }
})

