@echo off
cd /d %~dp0\..\..
npm run reset:leituras
if errorlevel 1 exit /b 1
pause
