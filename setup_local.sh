#!/bin/bash

# Modka 7Web Local Setup Script
# This script sets up the local development environment

echo "🚀 Setting up Modka 7Web locally..."

# Check if we're in the right directory
if [ ! -f "backend/requirements.txt" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Setup Python virtual environment
echo "📦 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Step 2: Install backend dependencies
echo "📦 Installing backend dependencies..."
source venv/bin/activate
pip install -r backend/requirements.txt
echo "✅ Backend dependencies installed"

# Step 3: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"

# Step 4: Create environment files if they don't exist
echo "⚙️  Setting up environment configuration..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env 2>/dev/null || echo "# Backend environment variables" > backend/.env
    echo "✅ Backend .env file created"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local 2>/dev/null || echo "# Frontend environment variables" > frontend/.env.local
    echo "✅ Frontend .env.local file created"
fi

# Step 5: Create run scripts
echo "📝 Creating run scripts..."

# Backend run script
cat > run_backend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
EOF
chmod +x run_backend.sh
echo "✅ Backend run script created: run_backend.sh"

# Frontend run script
cat > run_frontend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/frontend"
npm run dev -- --port 3000
EOF
chmod +x run_frontend.sh
echo "✅ Frontend run script created: run_frontend.sh"

# Combined run script
cat > run_both.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Modka 7Web..."
echo "📡 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
source venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
npm run dev -- --port 3000 &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '🛑 Servers stopped'; exit 0" INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF
chmod +x run_both.sh
echo "✅ Combined run script created: run_both.sh"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the application:"
echo "1. Quick start (both servers): ./run_both.sh"
echo "2. Backend only: ./run_backend.sh"
echo "3. Frontend only: ./run_frontend.sh"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API documentation at: http://localhost:8000/docs"
echo ""
echo "For Git operations:"
echo "- Check status: git status"
echo "- Add changes: git add ."
echo "- Commit: git commit -m 'Your message'"
echo "- Push: git push origin prod"