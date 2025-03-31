# 🚀 Quick Start Guide for modCA_7web

Welcome to modCA_7web! This guide will help you get the simulation running in minutes.

## 📋 Choose Your Platform

### Ubuntu/WSL2 (Recommended)
Best performance and compatibility with latest Python 3.12+

1. **System Setup**
   ```bash
   # Install required packages
   sudo apt update
   sudo apt install python3.12-full python3.12-dev build-essential git nodejs npm
   ```

2. **Get the Code**
   ```bash
   # Clone and enter directory
   git clone https://github.com/yourusername/modca_7web.git
   cd modca_7web
   ```

3. **Backend Setup**
   ```bash
   # Setup Python environment
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install --upgrade pip setuptools wheel
   pip install -r requirements_linux.txt
   
   # Start backend server
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. **Frontend Setup** (New Terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Windows (Native)
Stable environment with Python 3.8-3.11

1. **System Setup**
   - Install [Python 3.8-3.11](https://www.python.org/downloads/)
   - Install [Node.js 20+](https://nodejs.org/)
   - Install [Git](https://git-scm.com/download/win)

2. **Get the Code**
   ```powershell
   git clone https://github.com/yourusername/modca_7web.git
   cd modca_7web
   ```

3. **Backend Setup**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements_win.txt
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. **Frontend Setup** (New Terminal)
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## 🌐 Access the Application

Open your browser and navigate to:
- [http://localhost:3000](http://localhost:3000)

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

### Ubuntu/WSL2
```bash
# Permission denied
sudo chown -R $USER:$USER ~/projects/modca_7web

# Port in use
sudo lsof -i :8000
sudo lsof -i :3000
```

### Windows
- Use Command Prompt as Administrator if needed
- Ensure Python is in PATH
- Check ports 3000 and 8000 availability

## 🛑 Stopping the App

1. Press `Ctrl+C` in each terminal
2. Deactivate Python environment:
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