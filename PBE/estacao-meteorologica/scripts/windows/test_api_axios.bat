@echo off
cd /d %~dp0\..\..
npm run test:api
if errorlevel 1 exit /b 1
pause
