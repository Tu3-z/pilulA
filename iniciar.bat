@echo off
chcp 65001 >nul
title pilula* - Angular (ng serve)
cd /d "%~dp0"
echo.
echo   pilula*  ::  subindo o app Angular em http://localhost:4200
echo   (deixe esta janela aberta; feche ou aperte Ctrl+C para desligar)
echo.

where node >nul 2>nul
if not %errorlevel%==0 (
  echo   Nao achei o Node.js neste computador.
  echo   Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 22 (
  echo   Seu Node.js e antigo demais para o Angular 22.
  echo   Instale a versao LTS mais recente em https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo   Primeira vez por aqui: instalando dependencias, leva uns minutos...
  call npm install
  if errorlevel 1 (
    echo   Deu erro no npm install. Veja a mensagem acima.
    pause
    exit /b 1
  )
)

call npm start
pause
