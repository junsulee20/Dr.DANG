import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// 테스트용 JWT 토큰 생성
const userId = process.argv[2] || 'test-user-id';
const email = process.argv[3] || 'test@drdang.app';

const token = jwt.sign(
  {
    sub: userId,
    email: email,
    aud: 'authenticated',
    role: 'authenticated',
  },
  config.jwt.secret,
  {
    expiresIn: '7d',
  }
);

console.log('\n🔑 Generated JWT Token:');
console.log('━'.repeat(80));
console.log(token);
console.log('━'.repeat(80));
console.log('\n📋 User Info:');
console.log(`  ID: ${userId}`);
console.log(`  Email: ${email}`);
console.log('\n📝 Usage:');
console.log('  1. Copy the token above');
console.log('  2. Open Swagger UI: http://localhost:3001/api-docs/');
console.log('  3. Click "Authorize" button');
console.log('  4. Paste the token (without "Bearer")');
console.log('  5. Click "Authorize" then "Close"');
console.log('\n');

