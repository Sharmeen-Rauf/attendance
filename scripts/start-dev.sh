#!/bin/bash

# Start Development Servers

echo "🚀 Starting Attendance System..."

# Start Backend
echo "📡 Starting Django backend..."
cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers are running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

