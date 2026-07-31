@echo off
REM Inicia a API em modo desenvolvimento com nodemon
cd /d %~dp0\..\..
npm run dev
pause
