@echo off
setlocal
cd /d "%~dp0\..\.."
echo Verificando o servico PostgreSQL local...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0postgres_service.ps1" -Action Start
if errorlevel 1 exit /b 1
echo.
echo PostgreSQL local pronto.
pause
