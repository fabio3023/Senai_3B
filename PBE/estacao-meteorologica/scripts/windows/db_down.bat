@echo off
setlocal
cd /d "%~dp0\..\.."
echo ATENCAO: o PostgreSQL local pode ser usado por outros sistemas.
choice /C SN /N /M "Deseja realmente parar o servico PostgreSQL? [S/N] "
if errorlevel 2 exit /b 0
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0postgres_service.ps1" -Action Stop
if errorlevel 1 exit /b 1
pause
