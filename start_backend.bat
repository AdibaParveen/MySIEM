@echo off
title MySIEM - Backend API Server
echo Starting MySIEM FastAPI Backend Server...
cd /d "%~dp0backend"
..\.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
