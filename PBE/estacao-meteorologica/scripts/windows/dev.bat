@echo off
setlocal
cd /d "%~dp0\..\.."
if not exist .env (
  echo Arquivo .env nao encontrado.
  echo Execute: copy .env.example .env
  echo Depois informe a senha correta do PostgreSQL em DB_PASSWORD.
  exit /b 1
)
call npm run db:check
if errorlevel 1 exit /b 1
call npm run dev
if errorlevel 1 exit /b 1
pause
