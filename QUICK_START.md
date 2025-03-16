# modCA_7web Quick Start Guide

## Prerequisites
- Windows operating system
- Python 3.8+ installed and added to your PATH
- Node.js 16+ installed and added to your PATH
- Chrome web browser

## Starting the Application

**Option 1:** One-Click Startup
1. Double-click `start_app.bat`
2. Wait for both servers to start and Chrome to open
3. The application will be accessible at http://localhost:3000

**Option 2:** Desktop Shortcut
1. Double-click `create_desktop_shortcut.bat` to create a desktop shortcut
2. Launch anytime by double-clicking the "modCA_7web" shortcut on your desktop

## Stopping the Application
- Return to the console window where you started the application
- Press any key to shut down all servers
- Or simply close all the command prompt windows

## Cleaning Up Unnecessary Files
If you need to clean up the project directory:
1. Run `cleanup.bat` to remove unnecessary files and directories
2. This will delete temporary files, cache directories, and unused environments

## Troubleshooting
- Make sure Python and Node.js are installed correctly
- Check that ports 3000 (frontend) and 8000 (backend) are available
- If startup fails, try manually running:
  - Backend: `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
  - Frontend: `cd frontend && npm run dev` 