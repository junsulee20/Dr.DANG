# 모바일 테스트 가이드

## 모바일에서 앱 테스트하는 방법

### 방법 1: Expo Go 앱 사용 (가장 간단)

#### 1. Expo Go 앱 설치
- **iOS**: App Store에서 "Expo Go" 검색 및 설치
- **Android**: Google Play Store에서 "Expo Go" 검색 및 설치

#### 2. 개발 서버 실행
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start
```

#### 3. QR 코드 스캔
- 터미널에 QR 코드가 표시됩니다
- Expo Go 앱에서 QR 코드 스캔
- 또는 터미널에서 `i` (iOS) 또는 `a` (Android) 키 누르기

#### 4. 같은 네트워크 확인
- **중요**: 모바일 기기와 개발 머신이 **같은 Wi-Fi 네트워크**에 연결되어 있어야 합니다
- WSL2를 사용하는 경우 추가 설정 필요 (아래 참조)

### 방법 2: Tunnel 모드 사용 (다른 네트워크에서도 가능)

#### 1. Tunnel 모드로 시작
```bash
npm start -- --tunnel
```

#### 2. QR 코드 스캔
- Tunnel 모드에서는 어느 네트워크에서도 접속 가능
- 하지만 초기 연결이 느릴 수 있음

### 방법 3: 개발 빌드 사용 (고급)

#### 1. EAS Build 사용
```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인
eas login

# 개발 빌드 생성
eas build --profile development --platform ios
# 또는
eas build --profile development --platform android
```

#### 2. 빌드된 앱 설치
- 빌드가 완료되면 다운로드 링크 제공
- 기기에 설치 후 테스트

## WSL2 환경에서 모바일 테스트

### 문제점
WSL2는 가상 네트워크를 사용하므로, 모바일 기기에서 `localhost:8081`에 직접 접속할 수 없습니다.

### 해결 방법

#### 방법 1: Windows IP 주소 사용

1. **Windows IP 주소 확인**
   ```bash
   # WSL2에서 실행
   ipconfig.exe | grep "IPv4" | head -1
   # 또는 PowerShell에서
   ipconfig
   ```

2. **Expo 서버를 Windows IP로 바인딩**
   ```bash
   # Windows IP 주소로 시작 (예: 192.168.1.100)
   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npm start
   ```

3. **모바일에서 접속**
   - Expo Go 앱에서 `exp://192.168.1.100:8081` 입력
   - 또는 QR 코드 스캔 (자동으로 IP 주소 포함)

#### 방법 2: Tunnel 모드 사용 (권장)

```bash
npm start -- --tunnel
```

- Tunnel 모드는 ngrok을 사용하여 외부에서 접속 가능한 URL 생성
- 네트워크 설정과 관계없이 작동
- 초기 연결만 약간 느릴 수 있음

#### 방법 3: Windows에서 Expo 실행

1. **Windows PowerShell에서 실행**
   ```powershell
   cd C:\Users\YourUsername\path\to\Dr.DANG
   npm start
   ```

2. **모바일에서 접속**
   - 같은 Wi-Fi 네트워크에서 QR 코드 스캔

## 네트워크 문제 해결

### 문제: "Unable to connect to Metro bundler"

#### 해결 방법 1: 방화벽 설정
- Windows 방화벽에서 Node.js 허용
- 포트 8081, 19000, 19001 허용

#### 해결 방법 2: 네트워크 확인
```bash
# 개발 서버 IP 확인
hostname -I

# 모바일에서 ping 테스트
ping <서버_IP>
```

#### 해결 방법 3: Tunnel 사용
```bash
npm start -- --tunnel
```

### 문제: "Network request failed"

#### 해결 방법
1. 백엔드 서버가 실행 중인지 확인
   ```bash
   curl http://localhost:3001/health
   ```

2. 모바일에서 백엔드 서버 접근
   - 백엔드도 같은 네트워크에서 접근 가능해야 함
   - 또는 백엔드를 공개 URL로 배포 (예: ngrok 사용)

## 백엔드 서버 접근 (모바일에서)

### 개발 환경

#### 방법 1: 로컬 네트워크 IP 사용
1. **백엔드 서버 IP 확인**
   ```bash
   hostname -I
   ```

2. **프론트엔드 API URL 수정**
   ```typescript
   // constants/api.ts
   export const API_BASE_URL = 
     __DEV__ 
       ? 'http://192.168.1.100:3001' // 개발 머신의 로컬 IP
       : 'https://your-production-api-url.com';
   ```

3. **모바일에서 접근**
   - 모바일 기기와 개발 머신이 같은 Wi-Fi에 연결되어 있어야 함

#### 방법 2: ngrok 사용 (권장)

1. **ngrok 설치**
   ```bash
   npm install -g ngrok
   # 또는
   # https://ngrok.com/download
   ```

2. **백엔드 터널 생성**
   ```bash
   ngrok http 3001
   ```

3. **프론트엔드 API URL 수정**
   ```typescript
   // ngrok에서 제공하는 URL 사용
   export const API_BASE_URL = 'https://your-ngrok-url.ngrok.io';
   ```

## 빠른 시작 (권장)

### 1. Tunnel 모드로 시작 (가장 간단)
```bash
# 터미널 1: 백엔드
cd server
npm run dev

# 터미널 2: 프론트엔드 (Tunnel 모드)
cd /home/sean/next/drdang/Dr.DANG
npm start -- --tunnel
```

### 2. Expo Go 앱에서 QR 코드 스캔

### 3. 테스트
- 카카오 로그인
- 음식 분석
- 기능 테스트

## 참고사항

### 카카오 로그인 (모바일)
- 모바일에서도 카카오 로그인이 작동해야 합니다
- Deep linking이 제대로 설정되어 있어야 합니다
- `app.config.js`의 `scheme` 설정 확인

### 네트워크 보안
- 개발 환경에서는 로컬 네트워크 사용
- 프로덕션에서는 HTTPS 사용 필수

### 디버깅
- Expo Go 앱에서 흔들기 → "Debug Remote JS" 선택
- Chrome DevTools에서 디버깅 가능
- 로그는 터미널에 표시됩니다

