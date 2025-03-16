@echo off
echo.
echo ================================================
echo Cleaning up modCA_7web Application
echo ================================================
echo.

cd /d %~dp0

:: Remove unnecessary files and directories
echo Removing unnecessary files and directories...

:: Remove root level venv (backend has its own)
if exist venv (
    echo - Removing root level virtual environment...
    rmdir /s /q venv
)

:: Remove redundant settings.db from root (already exists in backend)
if exist settings.db (
    echo - Removing redundant settings.db from root directory...
    del /f /q settings.db
)

:: Remove Python cache directories
if exist __pycache__ (
    echo - Removing Python cache directory...
    rmdir /s /q __pycache__
)
if exist backend\app\__pycache__ (
    echo - Removing backend Python cache directory...
    rmdir /s /q backend\app\__pycache__
)

:: Remove temporary/test files
if exist population_trends.png (
    echo - Removing test visualization file...
    del /f /q population_trends.png
)
if exist simulation_report.md (
    echo - Removing test report file...
    del /f /q simulation_report.md
)
if exist init_git.bat (
    echo - Removing git initialization script...
    del /f /q init_git.bat
)

:: Clean frontend build artifacts
echo - Cleaning frontend build artifacts...
if exist frontend\.next (
    rmdir /s /q frontend\.next
)

:: Ask user if they want to remove specification files
echo.
echo Optional: Do you want to remove specification files?
echo These files contain project requirements but may not be needed for running the application.
set /p REMOVE_SPECS="Remove specification files? (y/n): "
if /i "%REMOVE_SPECS%"=="y" (
    if exist .cursor\modca_7*spec*.txt (
        echo - Removing specification files...
        del /f /q .cursor\modca_7*spec*.txt
    )
)

:: Clean duplicate readme if Quick Start exists
if exist README.md (
    if exist QUICK_START.md (
        echo - Removing duplicate documentation...
        del /f /q README.md
    )
)

echo.
echo ================================================
echo Cleanup completed successfully!
echo ================================================
echo.
echo Your modCA_7web application has been cleaned of unnecessary files.
echo You can now run start_app.bat to launch the application.
echo.
pause 