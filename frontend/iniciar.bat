@echo off
chcp 65001 >nul
title pilula* - servidor local (porta 5500)
cd /d "%~dp0"
echo.
echo   pilula*  ::  subindo o site em http://localhost:5500
echo   (deixe esta janela aberta; feche para desligar o servidor)
echo   obs.: a porta 8080 fica livre para o back-end (Spring Boot).
echo.

rem abre o navegador 3 segundos depois, quando o servidor ja estiver de pe
start "" cmd /c "timeout /t 3 >nul & start http://localhost:5500"

where node >nul 2>nul
if %errorlevel%==0 (
  call npx --yes http-server . -p 5500 -c-1 --silent
  goto :fim
)

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 5500
  goto :fim
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 5500
  goto :fim
)

echo   Nao achei Node.js nem Python neste computador.
echo   Instale o Node em https://nodejs.org e rode este arquivo de novo,
echo   ou abra a pasta no VS Code e use a extensao "Live Server".
pause

:fim
