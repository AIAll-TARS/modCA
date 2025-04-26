# 🚀 Quick Start Guide for modCA_7web

Welcome to modCA_7web! This guide will help you get the simulation running in minutes.

## 📋 Choose Your Platform

### Windows 11/10 with WSL2 (Recommended)
Best performance and compatibility with latest Python 3.12+

1. **Prerequisites**
   - Windows 11/10 with WSL2 installed
   - Ubuntu 24.04 LTS on WSL2
   - Windows Terminal (install from Microsoft Store)
   - Python 3.12+ (in WSL)
   - Node.js 20+ and npm (in WSL)

2. **Manual Launch**
   - Open two terminals:

   **Terminal 1 (Backend):**
   ```bash
   cd ~/projects/modca_7web/backend
   python3 -m venv venv  # Only first time
   source venv/bin/activate
   pip install -r requirements.txt  # Only first time
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd ~/projects/modca_7web/frontend
   npm install  # Only first time
   npm run dev -- --port 3000
   ```
   If port 3000 is busy, use:
   ```bash
   npm run dev -- --port 3001
   ```

3. **First-Time Setup**
   (see above for backend/frontend install commands)

### Native Ubuntu (Alternative)
For users running Ubuntu as their main OS

1. **System Setup**
   ```bash
   sudo apt update
   sudo apt install python3.12-full python3.12-dev build-essential git nodejs npm
   ```

2. **Manual Launch**
   - Use the same two-terminal approach as above.

## 🌐 Access the Application

The application will be available at:
- [http://localhost:3000](http://localhost:3000) (or 3001 if used)

## 🎮 Quick Usage Guide

1. **Start a Simulation**
   - Click "New Simulation"
   - Choose grid size (start with 50x50)
   - Click "Start"

2. **Adjust Parameters**
   - Use sliders to modify:
     - Initial populations
     - Birth/death rates
     - Starvation thresholds

3. **Controls**
   - Play/Pause: Space bar
   - Step Forward: Right arrow
   - Reset: R key
   - Full Screen: F key

## ⚠️ Common Issues

- Ensure ports 3000 (or 3001) and 8000 are available
- Check both backend and frontend are running
- Verify virtual environment is activated

## 🛑 Stopping the App

1. Press `Ctrl+C` in each terminal window
2. Or close the Windows Terminal windows
3. Deactivate Python environment if continuing development:
   ```bash
   deactivate
   ```

## 📚 Next Steps

- Check [README.md](README.md) for detailed documentation
- Explore [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) for development
- Join our [Discord community](https://discord.gg/yourdiscord) for help

## 🆘 Need Help?

- Create an issue on GitHub
- Check our FAQ in [README.md](README.md#troubleshooting)
- Contact: support@modca7web.com 