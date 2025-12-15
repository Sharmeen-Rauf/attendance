# 🏢 HR Attendance System

Complete attendance management system with offline support, mobile-friendly interface, and admin dashboard.

## Features

✅ **Mobile-Friendly Attendance Page**
- One-click attendance actions
- Auto-filled employee, date, and time
- Server-side time (no manipulation possible)

✅ **Offline Support**
- Works without internet
- Auto-syncs when connection restored
- Local storage backup

✅ **Smart Time Tracking**
- Late entry detection (Red/Yellow/Green)
- Grace period (10 minutes)
- Break duration tracking (max 30 minutes)

✅ **Admin Dashboard**
- Daily attendance reports
- Filters (Date, Employee, Status)
- Excel export with color coding

## Tech Stack

- **Frontend**: Next.js 14 (PWA)
- **Backend**: Django + DRF
- **Database**: MongoDB
- **Excel Export**: openpyxl

## Setup Instructions

### Frontend (Next.js)

```bash
npm install
npm run dev
```

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

## Configuration

1. **Frontend**: Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

2. **Backend**: Configure MongoDB in `backend/attendance_system/settings.py`:
   - Default: MongoDB on localhost:27017
   - For MongoDB Atlas: Update `DATABASES` setting with connection string

3. **Create Sample Employees**:
```bash
cd backend
python manage.py create_sample_employees
```

4. **Create Admin User** (optional):
```bash
cd backend
python manage.py createsuperuser
```

## Usage

1. **Employee**: Visit `/attendance` and click action buttons
2. **Admin**: Visit `/admin` for dashboard and reports

## API Endpoints

- `GET /api/time` - Get server time
- `POST /api/attendance` - Submit attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/export` - Export Excel
- `GET /api/employees` - Get employee list

