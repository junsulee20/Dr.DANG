import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Anon 키를 사용하는 클라이언트 (일반 작업용)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Service Role 키를 사용하는 클라이언트 (관리자 작업용 - RLS 우회)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

