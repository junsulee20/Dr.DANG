import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts'

export interface AuthUser {
  id: string
  email: string
}

function extractUserToken(req: Request): string | null {
  // 1) 우선 커스텀 헤더 확인 (모바일/웹 통합용)
  const customToken =
    req.headers.get('x-user-token') ||
    req.headers.get('X-User-Token') ||
    req.headers.get('x-user-auth')

  if (customToken?.trim()) {
    return customToken.trim()
  }

  // 2) 기본 Authorization 헤더 확인
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7).trim()

  // Edge Functions 게이트웨이를 위한 anon/service 키는 사용자 토큰이 아님
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (token === supabaseAnonKey || token === supabaseServiceKey) {
    return null
  }

  return token
}

// 검증용 키 캐시
let cachedVerificationKey: CryptoKey | null = null

async function getVerificationKey(): Promise<CryptoKey> {
  if (cachedVerificationKey) {
    return cachedVerificationKey
  }

  const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || ''
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.')
  }

  const encoder = new TextEncoder()
  const rawKey = encoder.encode(jwtSecret)

  cachedVerificationKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  )

  return cachedVerificationKey
}

/**
 * 요청에서 사용자 정보 추출 (JWT 직접 검증)
 * 우리가 발급한 JWT 토큰을 검증합니다.
 */
export async function getUserFromRequest(
  req: Request
): Promise<AuthUser | null> {
  try {
    const token = extractUserToken(req)
    if (!token) {
      console.log('토큰이 요청에 없습니다.')
      return null
    }

    // JWT Secret 가져오기
    const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || ''
    
    if (!jwtSecret) {
      console.error('JWT_SECRET이 설정되지 않았습니다.')
      return null
    }

    try {
      // CryptoKey 생성
      const key = await getVerificationKey()
      
      // JWT 검증 (HS256 알고리즘 명시)
      // djwt v3.0.2의 verify 함수는 알고리즘을 명시적으로 전달해야 할 수 있습니다
      const payload = await verify(token, key, 'HS256')

      if (!payload || typeof payload !== 'object') {
        console.error('JWT payload가 유효하지 않습니다.')
        return null
      }

      if (!payload.sub) {
        console.error('JWT payload에 sub가 없습니다.')
        return null
      }

      return {
        id: payload.sub as string,
        email: (payload.email as string) || '',
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      console.error('Token (first 50 chars):', token.substring(0, 50))
      // 더 자세한 오류 정보 로깅
      if (jwtError instanceof Error) {
        console.error('Error message:', jwtError.message)
        console.error('Error stack:', jwtError.stack)
      }
      return null
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

