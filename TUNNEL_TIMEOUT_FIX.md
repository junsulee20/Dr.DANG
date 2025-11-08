# Expo Tunnel 타임아웃 해결 가이드

## 문제: "The request timed out"

Expo tunnel 모드에서 타임아웃이 발생하는 주요 원인:

1. **앱 빌드 중 에러 발생**
   - 번들링 중 에러로 앱이 시작되지 않음
   - 주로 초기화 코드에서 발생

2. **네트워크 연결 문제**
   - Tunnel 연결이 불안정
   - 방화벽 차단

3. **메모리 부족 또는 빌드 시간 초과**
   - 앱이 너무 커서 빌드가 오래 걸림

## 해결 방법

### 1. 앱 에러 확인 (가장 중요)

#### 터미널에서 에러 확인
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start -- --clear
```

터미널에서 빌드 과정을 확인하고 에러가 있는지 체크:
- "Error:" 로 시작하는 메시지
- "Failed to compile" 메시지
- "ReferenceError" 등의 에러

#### 흔한 에러 수정

1. **"window is not defined"** - 이미 수정함
2. **"Supabase URL과 Anon Key가 설정되지 않음"** - 이미 수정함
3. **import 에러** - 모듈 설치 확인

### 2. 캐시 삭제 후 재시작

```bash
cd /home/sean/next/drdang/Dr.DANG

# 모든 프로세스 종료
pkill -f "expo"
pkill -f "metro"

# 캐시 삭제
rm -rf .expo node_modules/.cache

# 재시작
npm start -- --clear --tunnel
```

### 3. 로컬 모드로 테스트 (터널 없이)

먼저 로컬 모드에서 앱이 정상적으로 작동하는지 확인:

```bash
# 터널 없이 시작
npm start

# 웹 브라우저에서 테스트
# 터미널에서 'w' 키 누르기
```

웹에서 앱이 정상적으로 로드되면:
- 앱 코드는 문제없음
- Tunnel 연결 문제일 가능성

### 4. Tunnel 설정 변경

#### @expo/ngrok 수동 설치
```bash
npm install -g @expo/ngrok
```

#### Tunnel 재시작
```bash
npm start -- --tunnel
```

### 5. 개발 모드 확인

#### package.json 확인
```bash
cat package.json | grep '"start"'
```

출력이 `"start": "expo start"`인지 확인

## 빠른 진단

### 1. 웹에서 테스트
```bash
npm start
# 터미널에서 'w' 키 누르기
```

- **성공**: 앱 코드는 문제없음 → Tunnel 문제
- **실패**: 앱 코드에 에러 있음 → 에러 수정 필요

### 2. Tunnel 로그 확인
```bash
npm start -- --tunnel --verbose
```

상세한 로그에서 에러 원인 파악

### 3. ngrok 직접 사용
```bash
# Expo 서버 (터널 없이)
npm start

# 다른 터미널에서 ngrok
ngrok http 8081
```

## 현재 앱 상태 확인

### 빌드 성공 여부
```bash
npm start -- --clear
```

다음을 확인:
1. "Bundled successfully" 메시지
2. "Waiting on http://localhost:8081" 메시지
3. QR 코드가 생성되는지

### 에러가 있으면
- 에러 메시지 전체를 확인
- 어느 파일에서 에러가 발생하는지 확인
- 해당 파일 수정

## 실제 문제 가능성

### 가능성 1: AsyncStorage 문제 (이미 수정했지만)
- `lib/supabase.ts`에서 Platform별 스토리지 처리
- 웹과 네이티브 분리

### 가능성 2: Supabase 초기화 에러
- 환경 변수가 로드되지 않음
- `app.config.js`의 기본값 확인

### 가능성 3: 네트워크 타임아웃
- Tunnel 연결이 느림
- 앱 다운로드 시간이 오래 걸림

## 권장 해결 순서

1. **웹에서 먼저 테스트**
   ```bash
   npm start
   # 'w' 키로 웹 브라우저 실행
   ```

2. **에러 수정**
   - 웹에서 에러가 있으면 수정
   - 브라우저 콘솔(F12) 확인

3. **Tunnel 재시도**
   ```bash
   npm start -- --clear --tunnel
   ```

4. **여전히 실패하면 ngrok 사용**
   ```bash
   npm start  # 터널 없이
   ngrok http 8081  # 다른 터미널에서
   ```

## 지금 확인해야 할 것

1. Expo 서버를 `--clear` 옵션으로 재시작
2. 터미널에 나오는 모든 에러 메시지 확인
3. 에러 메시지 공유 (전체 스택 트레이스)

터미널에서 어떤 에러가 나오는지 확인해 주세요!

