#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping services..."
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
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

# Ensure dependencies are installed
# We set PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 to allow building pydantic-core on experimental Python versions (like 3.14)
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
backend/venv/bin/pip install -r backend/requirements.txt --quiet

# Start Backend
echo "📡 Starting Backend on http://localhost:8000..."
# We run as a module so relative imports in backend/main.py work
export PYTHONPATH=$PYTHONPATH:$(pwd)
backend/venv/bin/python -m backend.main > backend.log 2>&1 &
BACKEND_PID=$!

# 2. Setup Frontend
echo "📦 Setting up Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install --quiet && cd ..
fi

echo "🌐 Starting Frontend on http://localhost:3000..."
cd frontend
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
