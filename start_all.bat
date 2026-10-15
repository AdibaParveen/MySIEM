@echo off
title MySIEM Platform Launcher
echo ===================================================
echo           Starting MySIEM SOC Platform
echo ===================================================
echo 1. Launching FastAPI Backend on http://127.0.0.1:8000
start "MySIEM Backend" cmd /k "cd /d "%~dp0backend" && ..\.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Launching Vite Frontend on http://localhost:5173
start "MySIEM Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both services are booting up in separate terminal windows.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo Done!
