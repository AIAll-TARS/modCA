@echo off
setlocal enabledelayedexpansion

echo ================================================
echo Starting modCA_7web Application
echo ================================================

:: Set the current directory to the script location
cd /d %~dp0

:: Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python not found. Please install Python and try again.
    goto :error
)

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js and try again.
    goto :error
)

:: Check if backend virtual environment exists
if not exist backend\venv\Scripts\activate (
    echo Backend virtual environment not found.
    echo Creating a new virtual environment...
    cd backend
    python -m venv venv
    if !ERRORLEVEL! neq 0 (
        echo Failed to create virtual environment.
        cd ..
        goto :error
    )
    call venv\Scripts\activate
    pip install -r requirements.txt
    if !ERRORLEVEL! neq 0 (
        echo Failed to install backend requirements.
        cd ..
        goto :error
    )
    deactivate
    cd ..
)

:: Check if frontend dependencies are installed
if not exist frontend\node_modules (
    echo Frontend dependencies not found.
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo Failed to install frontend dependencies.
        cd ..
        goto :error
    )
    cd ..
)

:: Start the backend server
echo.
echo Starting backend server (FastAPI)...
start cmd /k "cd backend && call venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Give the backend a moment to start up
echo Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

:: Start the frontend server
echo.
echo Starting frontend server (Next.js)...
start cmd /k "cd frontend && npm run dev"

:: Give the frontend a moment to start up
echo Waiting for frontend to initialize...
timeout /t 10 /nobreak > nul

:: Open Chrome to the frontend URL
echo.
echo Opening Chrome to access the application...
start chrome http://localhost:3000

echo.
echo ================================================
echo modCA_7web is now running!
echo ================================================
echo.
echo - Backend API: http://localhost:8000
echo - Frontend UI: http://localhost:3000
echo.
echo Press any key to shut down all components, or close this window to keep them running.
pause > nul

:: If the user presses a key, find and kill the Node.js and Python processes
echo.
echo Shutting down servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

echo Application stopped successfully.
goto :eof

:error
echo.
echo Application startup failed. Please fix the errors and try again.
pause
exit /b 1 