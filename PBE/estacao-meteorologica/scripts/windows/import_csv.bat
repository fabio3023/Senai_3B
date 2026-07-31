@echo off
cd /d %~dp0\..\..
npm run import:csv
if errorlevel 1 exit /b 1
pause
