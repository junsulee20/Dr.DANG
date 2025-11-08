# Windows PowerShell 스크립트 - Expo 서버 시작
# WSL2 경로에서 실행

Write-Host "🚀 Expo 서버 시작 (Windows)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# WSL2 경로로 이동
$wslPath = "\\wsl$\Ubuntu\home\sean\next\drdang\Dr.DANG"
$localPath = "C:\Users\$env:USERNAME\Dr.DANG"

# 로컬에 복사할지 확인
Write-Host "WSL2 경로: $wslPath" -ForegroundColor Yellow
Write-Host "로컬 경로: $localPath" -ForegroundColor Yellow

# WSL2 경로로 이동 시도
if (Test-Path $wslPath) {
    Set-Location $wslPath
    Write-Host "✅ WSL2 경로로 이동 성공" -ForegroundColor Green
} else {
    Write-Host "❌ WSL2 경로를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "대안: 프로젝트를 Windows 로컬로 복사하거나" -ForegroundColor Yellow
    Write-Host "WSL2에서 'explorer.exe .' 명령어로 폴더를 열어주세요." -ForegroundColor Yellow
    exit 1
}

# Node.js 확인
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js 버전: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

# 의존성 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 의존성 설치 중..." -ForegroundColor Yellow
    npm install
}

# Expo 서버 시작
Write-Host "🚀 Expo 서버 시작 중..." -ForegroundColor Green
Write-Host "Tunnel 모드로 시작하려면: npm start -- --tunnel" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green

npm start

