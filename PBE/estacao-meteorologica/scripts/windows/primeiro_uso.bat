@echo off
setlocal
cd /d "%~dp0\..\.."
echo === Preparacao do projeto com PostgreSQL local ===
where node >nul 2>&1 || (echo Node.js nao encontrado.& exit /b 1)
where npm >nul 2>&1 || (echo npm nao encontrado.& exit /b 1)
if not exist .env (
  copy /Y .env.example .env >nul
  echo Arquivo .env criado.
  echo Abra o arquivo .env e ajuste DB_USER e DB_PASSWORD antes de continuar.
  start "" notepad .env
  echo Depois execute novamente este script.
  exit /b 0
)
call npm install
if errorlevel 1 exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0postgres_service.ps1" -Action Start
if errorlevel 1 exit /b 1
call npm run db:check
if errorlevel 1 exit /b 1
call npm run db:migrate
if errorlevel 1 exit /b 1
echo.
echo Projeto preparado. Execute scripts\windows\start.bat
pause
