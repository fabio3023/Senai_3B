@echo off
REM Importa o arquivo data\em.csv sem limpar a tabela antes
cd /d %~dp0\..\..
npm run import:csv
pause
