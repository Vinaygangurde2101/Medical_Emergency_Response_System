@echo off
echo Starting MERS SID Application...

echo Checking for node_modules...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend && npm install && cd ..
)
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo Starting Backend Server...
start cmd /k "cd backend && npx nodemon server.js"

echo Starting Frontend Development Server...
start cmd /k "cd frontend && npx vite --host"

echo.
echo Application services are starting in separate windows.
echo Local Frontend: http://localhost:5173
echo Check the Frontend terminal window for your Network IP (e.g., http://192.168.x.x:5173) to connect from mobile or other devices.
echo.
echo NOTE: If you see "Registration failed", make sure MongoDB is running!
pause
