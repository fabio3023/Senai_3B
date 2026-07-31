@echo off
setlocal
cd /d "%~dp0\..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0postgres_service.ps1" -Action Status
if errorlevel 1 exit /b 1
if exist .env (
  echo.
  echo Testando as credenciais configuradas no arquivo .env...
  call npm run db:check
)
pause
