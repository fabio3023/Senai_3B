@echo off
REM Limpa a tabela leituras e depois importa o arquivo data\em.csv
cd /d %~dp0\..\..
npm run import:csv:clear
pause
