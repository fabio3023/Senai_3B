@echo off
setlocal
cd /d "%~dp0\.."

if not exist .env (
  copy .env.example .env >nul
  echo Arquivo .env criado. Revise DB_USER e DB_PASSWORD antes de continuar.
  pause
)

if not exist node_modules (
  call npm install
  if errorlevel 1 exit /b 1
)

call npm start
endlocal
