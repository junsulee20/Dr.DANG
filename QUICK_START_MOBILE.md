# 모바일 테스트 빠른 시작 (WSL2 환경)

## 🎯 가장 간단한 방법: Windows에서 실행

### 1단계: Windows PowerShell 열기
- **WSL2 터미널이 아님!**
- Windows PowerShell 또는 Command Prompt 사용

### 2단계: 프로젝트 디렉토리로 이동

#### 방법 A: WSL2 경로 직접 접근
```powershell
cd \\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG
```

#### 방법 B: 프로젝트를 Windows로 복사
```powershell
# WSL2에서 실행
xcopy /E /I /Y "\\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG" "C:\Users\%USERNAME%\Dr.DANG"
```

### 3단계: Expo 서버 실행
```powershell
# 의존성 설치 (처음 한 번만)
npm install

# Expo 서버 시작
npm start

# Tunnel 모드 (필요시)
npm start -- --tunnel
```

### 4단계: 모바일에서 접속
1. **Expo Go 앱** 설치 (iOS/Android)
2. **QR 코드 스캔**
3. 또는 **수동으로 URL 입력**: `exp://Windows_IP:8081`

## 🔍 Windows IP 확인

```powershell
# Windows PowerShell에서
ipconfig

# IPv4 주소 확인 (예: 192.168.1.100)
```

## ⚠️ 문제 해결

### 문제: "\\wsl$\Ubuntu 경로를 찾을 수 없음"
**해결**:
1. Windows 파일 탐색기에서 `\\wsl$\Ubuntu` 접근 시도
2. 접근 불가면 프로젝트를 Windows로 복사

### 문제: "npm이 설치되어 있지 않음"
**해결**:
1. Node.js 설치: https://nodejs.org/
2. 또는 WSL2에서 실행 (아래 참조)

### 문제: "포트 8081이 이미 사용 중"
**해결**:
```powershell
# 포트를 사용하는 프로세스 확인
netstat -ano | findstr :8081

# 프로세스 종료
taskkill /PID <PID> /F
```

## 🔄 WSL2에서 실행 (대안)

WSL2에서 실행하려면:

### 방법 1: ngrok 사용
```bash
# 터미널 1: Expo 서버
npm start

# 터미널 2: ngrok
ngrok http 8081

# ngrok URL을 모바일에서 사용
```

### 방법 2: Windows IP로 바인딩
```bash
# WSL2에서 실행
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
npm start
```

그리고 Windows 방화벽에서 포트 8081 허용 필요

## 📱 모바일 테스트 체크리스트

- [ ] Windows와 모바일이 같은 Wi-Fi 네트워크에 연결
- [ ] Windows에서 Expo 서버 실행
- [ ] Expo Go 앱 설치됨
- [ ] QR 코드 스캔 또는 수동 URL 입력
- [ ] 연결 성공 확인

## 🚀 빠른 시작 명령어

### Windows PowerShell에서:
```powershell
cd \\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG
npm start -- --tunnel
```

### WSL2에서 (ngrok 사용):
```bash
cd /home/sean/next/drdang/Dr.DANG
npm start &
ngrok http 8081
```

## 💡 권장 방법

**WSL2 환경에서는 Windows에서 직접 실행하는 것이 가장 간단하고 안정적입니다.**

1. ✅ Windows PowerShell에서 실행
2. ✅ Tunnel 모드 사용
3. ✅ 같은 Wi-Fi 네트워크
4. ✅ QR 코드 스캔

이 방법이 가장 문제없이 작동합니다!

