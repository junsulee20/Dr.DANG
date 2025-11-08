# WSL2 환경에서 모바일 테스트 가이드

## 문제점
WSL2 환경에서 Expo tunnel 모드가 제대로 작동하지 않을 수 있습니다:
- `exp://172.22.166.53:8081` - WSL2 내부 IP (모바일에서 접근 불가)
- Tunnel 모드 타임아웃
- 네트워크 연결 실패

## 해결 방법

### 방법 1: Windows IP 사용 (권장)

#### 1.1 Windows IP 주소 확인
WSL2에서 Windows 호스트 IP 확인:
```bash
# WSL2에서 실행
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
# 또는
ip route show | grep -i default | awk '{print $3}'
```

#### 1.2 Windows에서 Expo 실행
**가장 간단한 방법**: Windows PowerShell에서 직접 실행

1. **Windows PowerShell 열기** (WSL이 아님)
2. 프로젝트 디렉토리로 이동:
   ```powershell
   cd C:\Users\YourUsername\path\to\Dr.DANG
   # 또는 WSL 경로를 Windows에서 접근
   cd \\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG
   ```
3. **Expo 서버 실행**:
   ```powershell
   npm start
   # 또는
   npx expo start
   ```
4. **QR 코드 스캔**
   - 같은 Wi-Fi 네트워크에서 QR 코드 스캔
   - 또는 tunnel 모드: `npm start -- --tunnel`

### 방법 2: WSL2에서 Windows IP로 바인딩

#### 2.1 Windows IP 확인
```bash
# WSL2에서 실행
export WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
echo "Windows IP: $WINDOWS_IP"
```

#### 2.2 Expo 서버를 모든 인터페이스에 바인딩
```bash
# 환경 변수 설정
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Expo 시작
npm start
```

#### 2.3 포트 포워딩 설정 (Windows PowerShell에서)
```powershell
# PowerShell을 관리자 권한으로 실행
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=WSL2_IP

# 예시:
# netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.22.166.53
```

### 방법 3: ngrok 사용 (가장 확실한 방법)

#### 3.1 ngrok 설치
```bash
# WSL2에서
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# 또는 npm으로
npm install -g ngrok
```

#### 3.2 ngrok으로 터널 생성
```bash
# 터미널 1: Expo 서버 실행
npm start

# 터미널 2: ngrok 터널 생성
ngrok http 8081
```

#### 3.3 ngrok URL 사용
- ngrok이 제공하는 HTTPS URL 사용
- 예: `https://abc123.ngrok.io`
- 모바일에서 이 URL로 접속

### 방법 4: Windows에서 WSL2 네트워크 접근

#### 4.1 Windows 방화벽 설정
1. Windows 설정 > 방화벽
2. 고급 설정
3. 인바운드 규칙 추가
4. 포트 8081 허용

#### 4.2 WSL2 네트워크 설정
```bash
# WSL2에서 실행
sudo apt update
sudo apt install net-tools

# 네트워크 인터페이스 확인
ifconfig
```

## 권장 해결 방법

### ✅ 가장 간단한 방법: Windows에서 실행

1. **Windows PowerShell 열기**
2. **프로젝트로 이동**:
   ```powershell
   cd \\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG
   ```
3. **의존성 설치** (처음 한 번만):
   ```powershell
   npm install
   ```
4. **Expo 서버 실행**:
   ```powershell
   npm start
   ```
5. **Tunnel 모드** (필요시):
   ```powershell
   npm start -- --tunnel
   ```

### ✅ 대안: ngrok 사용

```bash
# 터미널 1: 백엔드
cd server
npm run dev

# 터미널 2: 프론트엔드
cd /home/sean/next/drdang/Dr.DANG
npm start

# 터미널 3: ngrok
ngrok http 8081
```

ngrok URL을 모바일에서 사용

## WSL2 네트워크 문제 해결

### 문제: exp://172.22.166.53:8081 접속 불가

**원인**: 
- 172.22.166.53은 WSL2 내부 IP
- 모바일 기기에서 WSL2 내부 네트워크에 접근 불가

**해결**:
1. Windows IP 사용
2. Windows에서 Expo 실행
3. ngrok 사용

### 문제: Tunnel 모드 타임아웃

**원인**:
- WSL2 환경에서 Expo tunnel이 제대로 작동하지 않음
- 네트워크 설정 문제

**해결**:
1. Windows에서 실행
2. ngrok 사용
3. 로컬 네트워크 사용 (같은 Wi-Fi)

## 빠른 시작 (Windows에서)

```powershell
# Windows PowerShell에서
cd \\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG
npm start -- --tunnel
```

## 체크리스트

- [ ] Windows와 모바일이 같은 Wi-Fi 네트워크에 연결되어 있음
- [ ] Windows 방화벽에서 포트 8081 허용
- [ ] Expo 서버가 정상적으로 시작됨
- [ ] QR 코드가 생성됨
- [ ] 모바일에서 Expo Go 앱 설치됨

## 추가 팁

### Expo Go 앱에서 수동 연결
1. Expo Go 앱 열기
2. "Enter URL manually" 선택
3. `exp://Windows_IP:8081` 입력
   - 예: `exp://192.168.1.100:8081`

### Windows IP 확인
```powershell
# Windows PowerShell에서
ipconfig
# IPv4 주소 확인 (예: 192.168.1.100)
```

### 네트워크 테스트
```bash
# 모바일에서 Windows IP로 ping 테스트
ping 192.168.1.100
```

## 결론

**WSL2 환경에서는 Windows에서 직접 실행하는 것이 가장 간단합니다.**

1. Windows PowerShell에서 실행
2. 또는 ngrok 사용
3. WSL2에서 직접 실행은 네트워크 설정이 복잡함

