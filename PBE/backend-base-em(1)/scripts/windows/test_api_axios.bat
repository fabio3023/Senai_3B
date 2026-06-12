@echo off
cd %~dp0\..\..
cmd /k npm run test:api
