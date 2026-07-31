@echo off
cd /d %~dp0\..\..
npm run check
if errorlevel 1 exit /b 1
npm test
if errorlevel 1 exit /b 1
pause
