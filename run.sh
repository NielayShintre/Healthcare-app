#!/bin/bash

# MediLens AI Platform - Startup Script
# Optimized for macOS with Python 3.13 / 3.14 handling

echo "🚀 Initializing MediLens AI Platform..."

# Get absolute path of project root
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Check for Python 3.13 (Preferred for compatibility)
PYTHON_CMD=""
if command -v /opt/homebrew/bin/python3.13 &> /dev/null; then
    PYTHON_CMD="/opt/homebrew/bin/python3.13"
elif command -v python3.13 &> /dev/null; then
    PYTHON_CMD="python3.13"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
else
    PYTHON_CMD="python3"
fi

echo "🐍 Using Python: $($PYTHON_CMD --version)"

# 1. Setup Backend
echo "📡 Setting up Backend..."
cd "$BACKEND_DIR"

# Reset venv if it was created with a different python version
if [ -d "venv" ]; then
    VENV_PYTHON_VER=$(./venv/bin/python --version 2>&1)
    CURRENT_PYTHON_VER=$($PYTHON_CMD --version 2>&1)
    if [ "$VENV_PYTHON_VER" != "$CURRENT_PYTHON_VER" ]; then
        echo "♻️ Recreating virtual environment for version compatibility..."
        rm -rf venv
    fi
fi

if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
# Set ABI forward compatibility for Python 3.14 just in case, but 3.13 is primary now
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
pip install -r requirements.txt

# Start Backend in background
echo "📡 Starting Backend on http://localhost:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# 2. Setup Frontend
echo "📦 Setting up Frontend..."
cd "$FRONTEND_DIR"

# Only install if node_modules doesn't exist to save time
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start Frontend in background
echo "🌐 Starting Frontend on http://localhost:3000..."
npm run dev -- --port 3000 > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopping services...'; exit" INT TERM

echo "✅ All services are starting up!"
echo "------------------------------------------------"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Logs: backend.log, frontend.log"
echo "------------------------------------------------"
echo "Press Ctrl+C to stop both services."

# Keep script running
wait
