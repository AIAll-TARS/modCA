#!/bin/bash

echo "================================================"
echo "Starting modCA_7web Application"
echo "================================================"

# Set the current directory to the script location
cd "$(dirname "$0")"

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found. Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js and try again."
    exit 1
fi

# Check if backend virtual environment exists
if [ ! -d "backend/venv/bin" ]; then
    echo "Backend virtual environment not found."
    echo "Creating a new virtual environment..."
    cd backend
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment."
        cd ..
        exit 1
    fi
    source venv/bin/activate
    python3 -m pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install backend requirements."
        cd ..
        exit 1
    fi
    deactivate
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies not found."
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install frontend dependencies."
        cd ..
        exit 1
    fi
    cd ..
fi

# Start the backend server
echo
echo "Starting backend server (FastAPI)..."
cd backend
source venv/bin/activate
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give the backend a moment to start up
echo "Waiting for backend to initialize..."
sleep 8

# Start the frontend server
echo
echo "Starting frontend server (Next.js)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Give the frontend a moment to start up
echo "Waiting for frontend to initialize..."
sleep 10

echo
echo "================================================"
echo "modCA_7web is now running!"
echo "================================================"
echo
echo "- Backend API: http://localhost:8000"
echo "- Frontend UI: http://localhost:3000"
echo
echo "Press Ctrl+C to shut down all components"

# Handle shutdown gracefully
trap 'kill $BACKEND_PID $FRONTEND_PID; exit 0' SIGINT SIGTERM

# Wait for both processes
wait 