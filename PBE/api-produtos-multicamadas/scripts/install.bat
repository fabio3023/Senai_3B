@echo off
setlocal
cd /d "%~dp0\.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale o Node.js 18 ou superior.
  exit /b 1
)

if not exist .env (
  copy .env.example .env >nul
  echo Arquivo .env criado. Revise principalmente DB_USER e DB_PASSWORD.
)

call npm install
if errorlevel 1 exit /b 1

call npm run check
if errorlevel 1 exit /b 1

echo Instalacao concluida.
endlocal
