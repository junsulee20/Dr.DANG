import { supabaseAdmin } from '../config/supabase';
import jwt from 'jsonwebtoken';

/**
 * 테스트용 사용자 생성 및 JWT 토큰 발급
 */
export async function createTestUserAndToken() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client가 설정되지 않았습니다.');
  }

  // 테스트용 사용자 생성
  const testUser = {
    kakao_id: `test_${Date.now()}`,
    email: `test_${Date.now()}@test.com`,
    nickname: '테스트 사용자',
    profile_image: null,
  };

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert(testUser)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // JWT 토큰 생성
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }

  const token = jwt.sign(
    { userId: user.id },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    user,
    token,
  };
}

/**
 * 테스트용 사용자 삭제
 */
export async function deleteTestUser(userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client가 설정되지 않았습니다.');
  }

  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

