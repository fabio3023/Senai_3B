@echo off
cd /d %~dp0\..\..
npm run db:migrate
if errorlevel 1 exit /b 1
pause
