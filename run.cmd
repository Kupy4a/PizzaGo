@echo off
rem Starts PizzaGo on Windows. Usage: run.cmd [dev^|prod]
cd /d "%~dp0"
node scripts\start.mjs %*
if errorlevel 1 pause
