import bcrypt from 'bcryptjs';
import { validateEnv } from '../config/env';
import { supabaseAdmin } from '../config/supabase';

interface CliOptions {
  email?: string;
  password?: string;
  name?: string;
}

function printUsage() {
  console.log('\n이메일 로그인용 계정을 생성/업데이트하는 스크립트입니다.');
  console.log('\n사용법:');
  console.log('  npm run create:email-user -- --email=user@example.com --password=비밀번호 --name="홍길동"');
  console.log('또는:');
  console.log('  npx ts-node src/scripts/create-email-user.ts user@example.com 비밀번호 "홍길동"');
  console.log('\n필수: --email, --password');
  console.log('옵션: --name (미입력 시 이메일 앞부분 사용)\n');
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  const setOption = (key: string, value?: string) => {
    if (!value) {
      return;
    }
    if (key === 'email' || key === 'password' || key === 'name') {
      options[key] = value;
    }
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [rawKey, rawValue] = arg.substring(2).split('=');
      if (rawValue !== undefined) {
        setOption(rawKey, rawValue);
      } else {
        const next = args[i + 1];
        if (next && !next.startsWith('--')) {
          setOption(rawKey, next);
          i++;
        } else {
          setOption(rawKey, undefined);
        }
      }
    } else if (!options.email) {
      options.email = arg;
    } else if (!options.password) {
      options.password = arg;
    } else if (!options.name) {
      options.name = arg;
    }
  }

  return options;
}

async function main() {
  validateEnv();
  const { email, password, name } = parseArgs();

  if (!email || !password) {
    printUsage();
    console.error('❌ 이메일과 비밀번호는 필수입니다.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const displayName =
    name?.trim() ||
    normalizedEmail
      .split('@')[0]
      .replace(/[^a-zA-Z0-9가-힣]/g, ' ')
      .trim() ||
    '이메일 사용자';

  console.log('\n===========================================');
  console.log('📧 이메일 로그인 계정 설정');
  console.log('===========================================');
  console.log(`이메일 : ${normalizedEmail}`);
  console.log(`이름   : ${displayName}`);
  console.log('비밀번호 해시 생성 중...');

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: existingUsers, error: searchError } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .eq('email', normalizedEmail)
    .limit(1);

  if (searchError) {
    console.error('❌ 사용자 조회 실패:', searchError.message);
    process.exit(1);
  }

  const existingUser = existingUsers?.[0];

  if (existingUser) {
    console.log(`\n🔄 기존 사용자(${existingUser.id}) 비밀번호 갱신 중...`);
    const updateData: Record<string, any> = {
      password_hash: passwordHash,
    };
    if (name) {
      updateData.name = displayName;
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', existingUser.id);

    if (updateError) {
      console.error('❌ 비밀번호 갱신 실패:', updateError.message);
      process.exit(1);
    }

    console.log('✅ 비밀번호가 성공적으로 업데이트되었습니다.');
  } else {
    console.log('\n🆕 새로운 사용자 생성 중...');
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalizedEmail,
        name: displayName,
        password_hash: passwordHash,
      })
      .select('id, email, name')
      .single();

    if (insertError) {
      console.error('❌ 사용자 생성 실패:', insertError.message);
      process.exit(1);
    }

    console.log('✅ 새 사용자가 생성되었습니다.');
    console.log(`   ID   : ${newUser.id}`);
    console.log(`   이름 : ${newUser.name}`);
    console.log(`   이메일 : ${newUser.email}`);
  }

  console.log('\n🚪 이제 앱에서 이메일/비밀번호로 로그인할 수 있습니다.');
  console.log('===========================================\n');
}

main().catch((error) => {
  console.error('❌ 스크립트 실행 중 오류가 발생했습니다:', error);
  process.exit(1);
});

