#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Modka 7Web..."
echo "📡 Backend: http://localhost:8002"
echo "🌐 Frontend: http://localhost:3002"
echo "📊 API Docs: http://localhost:8002/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
source venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002 &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
npm run dev -- --port 3002 &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '🛑 Servers stopped'; exit 0" INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
