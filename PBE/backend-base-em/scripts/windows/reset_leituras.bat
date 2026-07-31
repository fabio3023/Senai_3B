@echo off
REM Remove todos os registros da tabela leituras
cd /d %~dp0\..\..
npm run reset:leituras
pause
