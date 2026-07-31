@echo off
REM Testa a API usando Axios. A API precisa estar ligada antes.
cd /d %~dp0\..\..
npm run test:api
pause
