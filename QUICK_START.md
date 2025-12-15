# ⚡ Quick Start Guide

## 🎯 5-Minute Setup

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### 2. Start MongoDB

**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Start MongoDB service
- Default connection: `localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `backend/attendance_system/settings.py`

### 3. Configure Environment

**Frontend:**
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Initialize Database

```bash
cd backend
python manage.py migrate
python manage.py create_sample_employees
```

### 5. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access System

- **Employee Page**: http://localhost:3000/attendance
- **Admin Dashboard**: http://localhost:3000/admin
- **Django Admin**: http://localhost:8000/admin

## 🧪 Test the System

1. Open http://localhost:3000/attendance
2. Select an employee from dropdown
3. Click **🟢 Check-In**
4. Click **🟡 Break-In**
5. Wait a few seconds, then click **🟠 Break-Out**
6. Click **🔵 Check-Out**
7. Go to Admin Dashboard to see the record
8. Export Excel report

## ✅ That's It!

Your attendance system is ready! 🎉

## 🐛 Troubleshooting

**MongoDB Connection Error?**
- Check if MongoDB is running: `mongod --version`
- Verify connection in settings.py

**CORS Error?**
- Check `CORS_ALLOWED_ORIGINS` in `backend/attendance_system/settings.py`
- Add your frontend URL if different

**Port Already in Use?**
- Backend: Change port in `runserver 8001`
- Frontend: Change port in `package.json` scripts

