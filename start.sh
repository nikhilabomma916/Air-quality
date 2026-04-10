#!/bin/bash

# Air Quality Monitor - Complete Startup Script
# This script starts both backend and frontend servers

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "================================"
echo "🚀 Air Quality Monitor Dashboard"
echo "================================"

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install it:"
    echo "   brew install postgresql@15"
    exit 1
fi

# Check if PostgreSQL is running
if ! psql -U postgres -c "SELECT 1;" &> /dev/null; then
    echo "🔄 Starting PostgreSQL..."
    brew services start postgresql@15 || true
fi

# Install and setup backend
echo ""
echo "📦 Setting up Backend..."
cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

# Setup database
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw air_quality_db; then
    echo "🗄️  Setting up database..."
    npm run setup-db
else
    echo "✓ Database already exists"
fi

# Install and setup frontend
echo ""
echo "🎨 Setting up Frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Start servers
echo ""
echo "================================"
echo "🎉 Starting servers..."
echo "================================"

# Start backend in background
echo "Starting Backend on port 49217..."
cd "$BACKEND_DIR"
npm start > "$PROJECT_DIR/.backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 3

# Start frontend in background
echo "Starting Frontend on port 51783..."
cd "$FRONTEND_DIR"
npm run dev > "$PROJECT_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "================================"
echo "✅ Dashboard Running!"
echo "================================"
echo ""
echo "Frontend:   http://localhost:51783"
echo "Backend:    http://localhost:49217"
echo "WebSocket:  ws://localhost:49218"
echo ""
echo "📊 API Endpoints:"
echo "  GET http://localhost:49217/api/latest"
echo "  GET http://localhost:49217/api/map-data"
echo "  GET http://localhost:49217/api/alerts"
echo "  GET http://localhost:49217/api/stats"
echo ""
echo "📝 Logs:"
echo "  Backend:  $PROJECT_DIR/.backend.log"
echo "  Frontend: $PROJECT_DIR/.frontend.log"
echo ""
echo "Ctrl+C to stop servers"
echo ""

# Save PIDs for cleanup
echo "$BACKEND_PID" > "$PROJECT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_DIR/.frontend.pid"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    [ -f "$PROJECT_DIR/.backend.pid" ] && kill $(cat "$PROJECT_DIR/.backend.pid") 2>/dev/null || true
    [ -f "$PROJECT_DIR/.frontend.pid" ] && kill $(cat "$PROJECT_DIR/.frontend.pid") 2>/dev/null || true
    rm -f "$PROJECT_DIR/.backend.pid" "$PROJECT_DIR/.frontend.pid"
    echo "✓ Shutdown complete"
}

trap cleanup EXIT

# Wait for all background processes
wait
