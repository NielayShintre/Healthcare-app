#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap SIGINT and SIGTERM to cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Starting MediLens Unified Development Environment..."

# 1. Setup Backend
echo "📦 Setting up Backend..."
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv backend/venv
fi
source backend/venv/bin/activate
pip install -r backend/requirements.txt --quiet

# Start Backend
echo "📡 Starting Backend on http://localhost:8000..."
export PYTHONPATH=$PYTHONPATH:$(pwd)
python -m backend.main > backend.log 2>&1 &
BACKEND_PID=$!

# 2. Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install --quiet
echo "🌐 Starting Frontend on http://localhost:3000..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ All services are starting up!"
echo "------------------------------------------------"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Logs: backend.log, frontend.log"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop both services."

# Wait for both processes
wait
