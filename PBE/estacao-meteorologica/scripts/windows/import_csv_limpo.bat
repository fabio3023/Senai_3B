@echo off
cd /d %~dp0\..\..
npm run import:csv:clear
if errorlevel 1 exit /b 1
pause
