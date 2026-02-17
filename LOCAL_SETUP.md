# 🚀 Modka 7Web Local Development Setup

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup_local.sh
   ```

2. **Start the application:**
   ```bash
   ./run_both.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:8002
   - API Documentation: http://localhost:8002/docs

## ✅ Current Status (2026-02-17)
- **Simulation:** Fully functional and working locally
- **Features verified:**
  - Simulation creation and WebSocket connection
  - Grid visualization with predator/prey/substrate
  - Real-time statistics updates
  - Parameter adjustment controls
  - Auto-run and manual stepping
- **Issues resolved:**
  - Fixed WebSocket URL configuration
  - Fixed null reference errors in statistics display
  - Fixed UI switching between setup and running states
  - Resolved model configuration issues

## Manual Setup

### Backend Setup
```bash
cd /home/aiall/projects/a777

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time only)
pip install -r backend/requirements.txt

# Run backend server
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```bash
cd /home/aiall/projects/a777/frontend

# Install dependencies (first time only)
npm install

# Run frontend server
npm run dev -- --port 3000
```

## Git Operations

The project is already set up with Git on the `prod` branch. To track your changes:

```bash
cd /home/aiall/projects/a777

# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin prod
```

## Project Structure

```
a777/
├── backend/              # FastAPI Python backend
│   ├── app/             # Application code
│   │   ├── main.py      # FastAPI application
│   │   ├── simulation.py # Cellular automata logic
│   │   ├── grid.py      # Grid management
│   │   └── ...
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Container configuration
├── frontend/            # Next.js React frontend
│   ├── src/             # React components
│   ├── package.json     # Node.js dependencies
│   └── ...
├── deployment/          # Deployment configurations
├── docs/               # Documentation
└── setup_local.sh      # Local setup script
```

## Application Features

- **Cellular Automata Simulation**: Predator-prey-substrate ecosystem
- **Real-time Visualization**: Grid display and population graphs
- **WebSocket Support**: Live simulation updates
- **Parameter Customization**: Adjustable simulation settings
- **Responsive Design**: Works on desktop and mobile

## Development Workflow

1. **Make changes** to backend (Python) or frontend (React/TypeScript)
2. **Test locally** using the run scripts
3. **Commit changes** to Git
4. **Run simulations** and verify functionality
5. **Push changes** when ready

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Find process using port 3000
lsof -i :3000

# Kill the process
kill <PID>
```

### Python Virtual Environment Issues
```bash
# Deactivate current environment
deactivate

# Remove and recreate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Node.js Issues
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
```

## Next Steps

1. Explore the simulation parameters
2. Modify cellular automata rules
3. Add new visualization features
4. Extend the ecosystem model
5. Deploy to production when ready

## Need Help?

Check the existing documentation:
- `README.md` - Project overview
- `DEVELOPER_DOCUMENTATION.md` - Detailed technical docs
- `QUICK_START.md` - Quick setup guide