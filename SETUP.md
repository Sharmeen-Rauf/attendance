# 🚀 Setup Guide - Attendance System

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (running locally or remote)

## Step 1: Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and set your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run development server
npm run dev
```

Frontend will run on: http://localhost:3000

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file (optional, can use system env vars)
# cp .env.example .env

# Run migrations (if using SQLite fallback)
python manage.py migrate

# Create sample employees
python manage.py create_sample_employees

# Run development server
python manage.py runserver
```

Backend will run on: http://localhost:8000

## Step 3: MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. No additional configuration needed (default: localhost:27017)

### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/attendance_system/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'djongo',
           'NAME': 'attendance_db',
           'CLIENT': {
               'host': 'your-atlas-connection-string',
           }
       }
   }
   ```

## Step 4: Access the System

1. **Employee Attendance**: http://localhost:3000/attendance
2. **Admin Dashboard**: http://localhost:3000/admin
3. **Django Admin**: http://localhost:8000/admin

## Testing

1. Open attendance page
2. Select an employee
3. Click "Check-In"
4. Try Break-In/Break-Out
5. Click "Check-Out"
6. Go to Admin Dashboard to view records
7. Export Excel report

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in settings.py
- Verify network/firewall settings

### CORS Errors
- Check CORS_ALLOWED_ORIGINS in settings.py
- Ensure frontend URL is included

### Offline Mode Not Working
- Check browser console for errors
- Verify service worker is registered
- Clear browser cache and reload

## Production Deployment

1. Set `DEBUG = False` in settings.py
2. Generate new `SECRET_KEY`
3. Configure proper CORS origins
4. Set up proper MongoDB authentication
5. Use environment variables for sensitive data
6. Build frontend: `npm run build`
7. Use production WSGI server (gunicorn, uwsgi)

