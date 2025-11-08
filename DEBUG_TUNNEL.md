# Tunnel 타임아웃 디버깅 가이드

## 문제 진단

"The request timed out" 에러는 주로 다음 원인으로 발생합니다:

1. **앱 빌드 중 에러 발생** (90% 가능성)
   - 앱이 빌드되다가 에러로 중단
   - 모바일에서 앱을 다운로드하지 못함

2. **네트워크 연결 문제** (5%)
   - Tunnel 연결이 불안정
   - 방화벽 차단

3. **앱이 너무 커서 다운로드 시간 초과** (5%)
   - 빌드 번들이 너무 큼

## 진단 방법

### 1단계: 웹에서 먼저 테스트 (필수)

```bash
cd /home/sean/next/drdang/Dr.DANG
npm start -- --clear

# 터미널에서 'w' 키 눌러 웹 브라우저 실행
```

**결과 분석**:
- ✅ 웹에서 앱이 정상 로드됨 → Tunnel 문제, 4단계로
- ❌ 웹에서 에러 발생 → 앱 코드 문제, 2단계로

### 2단계: 에러 로그 확인

터미널에서 다음 에러를 찾기:

#### 흔한 에러 1: Module not found
```
Error: Unable to resolve module @/...
```
**해결**:
```bash
npm install
```

#### 흔한 에러 2: window is not defined
```
ReferenceError: window is not defined
```
**해결**: 이미 수정했지만, 캐시 삭제 필요
```bash
rm -rf .expo node_modules/.cache
npm start -- --clear
```

#### 흔한 에러 3: Supabase 설정
```
Error: Supabase URL과 Anon Key가 설정되지 않음
```
**해결**: `app.config.js`에 기본값이 있어야 함 (이미 설정됨)

### 3단계: 브라우저 콘솔 확인

웹에서 실행 시:
1. 브라우저 개발자 도구(F12) 열기
2. Console 탭에서 에러 확인
3. 에러가 있으면 해당 파일 수정

### 4단계: Tunnel 재시도

앱이 웹에서 정상 작동하면:

```bash
# 캐시 삭제
rm -rf .expo node_modules/.cache

# Tunnel로 재시작
npm start -- --clear --tunnel
```

## 빠른 해결 방법

### 옵션 1: 웹에서 테스트
```bash
npm start
# 'w' 키로 웹 실행
```

### 옵션 2: iOS 시뮬레이터 사용
```bash
npm start
# 'i' 키로 iOS 시뮬레이터 실행
```

### 옵션 3: Android 에뮬레이터 사용
```bash
npm start
# 'a' 키로 Android 에뮬레이터 실행
```

### 옵션 4: ngrok 사용
```bash
# 터미널 1
npm start  # tunnel 없이

# 터미널 2
ngrok http 8081
```

## 현재 상태 확인 명령어

```bash
# 1. 캐시 삭제
rm -rf .expo node_modules/.cache

# 2. Expo 재시작 (에러 확인용)
npm start -- --clear

# 3. 빌드 성공 메시지 확인
# "Bundled successfully" 또는 "Web Bundled" 메시지가 나오는지 확인

# 4. 웹에서 테스트
# 터미널에서 'w' 키 누르기
```

## 다음 단계

1. 위 명령어로 앱 재시작
2. 터미널에 나오는 **모든 에러 메시지** 확인
3. 웹에서 테스트 (`w` 키)
4. 브라우저 콘솔에서 에러 확인 (F12)
5. 에러 메시지 공유

에러 메시지가 있으면 공유해 주세요. 정확한 해결 방법을 제시하겠습니다!

