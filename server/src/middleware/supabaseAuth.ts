import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export interface SupabaseAuthRequest extends Request {
  userId?: string;
  supabaseUser?: any;
}

/**
 * Supabase Access Token 인증 미들웨어
 * Supabase Auth의 access_token을 검증하여 사용자 정보를 추출합니다.
 */
export async function authenticateSupabaseToken(
  req: SupabaseAuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: { message: '인증 토큰이 필요합니다.' },
    });
  }

  try {
    // Supabase access_token으로 사용자 정보 가져오기
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: { message: '유효하지 않은 토큰입니다.' },
      });
    }

    // Supabase users 테이블에서 사용자 찾기 (id로 직접 매칭)
    // Supabase Auth의 user.id와 users 테이블의 id가 동일해야 함
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (dbError || !dbUser) {
      // 사용자가 DB에 없으면 생성
      // 카카오에서 받을 수 있는 정보가 제한적이므로 optional 필드는 기본값 처리
      const kakaoId = user.user_metadata?.provider_id 
        || user.user_metadata?.sub 
        || user.identities?.[0]?.identity_data?.sub
        || `kakao_${user.id}`;
      
      const nickname = user.user_metadata?.nickname 
        || user.user_metadata?.full_name 
        || user.user_metadata?.name
        || `사용자_${user.id.substring(0, 8)}`;
      
      const email = user.email || null; // email은 optional
      const profileImage = user.user_metadata?.avatar_url 
        || user.user_metadata?.picture 
        || user.user_metadata?.profile_image
        || null; // profile_image는 optional

      console.log('[User Creation]', {
        id: user.id,
        kakaoId,
        nickname,
        hasEmail: !!email,
        hasProfileImage: !!profileImage,
      });

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id, // Supabase Auth의 user.id 사용
          kakao_id: kakaoId,
          email: email, // NULL 허용
          nickname: nickname, // 최소한 닉네임은 있어야 함
          profile_image: profileImage, // NULL 허용
        })
        .select()
        .single();

      if (createError) {
        console.error('사용자 생성 오류:', createError);
        // 이미 존재하는 사용자인 경우 (동시 요청 등)
        if (createError.code === '23505') {
          // 기존 사용자 조회
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (existingUser) {
            req.userId = existingUser.id;
          } else {
            return res.status(500).json({
              error: { message: '사용자 생성에 실패했습니다.' },
            });
          }
        } else {
          return res.status(500).json({
            error: { message: '사용자 생성에 실패했습니다.' },
          });
        }
      } else {
        req.userId = newUser.id;
      }
    } else {
      req.userId = dbUser.id;
    }

    req.supabaseUser = user;
    next();
  } catch (error: any) {
    console.error('Supabase 인증 오류:', error);
    return res.status(403).json({
      error: { message: '인증 처리 중 오류가 발생했습니다.' },
    });
  }
}

