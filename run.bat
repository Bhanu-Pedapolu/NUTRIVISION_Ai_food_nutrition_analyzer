@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo       Starting NutriVision - AI Nutrition Analyzer
echo ========================================================
echo.

node run.mjs
pause
