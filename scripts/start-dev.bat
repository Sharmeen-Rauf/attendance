@echo off
echo Starting Attendance System...

echo Starting Django backend...
start cmd /k "cd backend && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting Next.js frontend...
start cmd /k "npm run dev"

echo Both servers are starting!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000

pause

