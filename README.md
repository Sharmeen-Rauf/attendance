# 🏢 HR Attendance System

Complete attendance management system with offline support, mobile-friendly interface, and admin dashboard.

**🚀 Ready to deploy on Vercel in minutes!**

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
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB Atlas
- **Excel Export**: xlsx
- **Deployment**: Vercel (One-click deploy)

## Quick Start (Local Development)

1. **Install Dependencies:**
```bash
npm install
```

2. **Set Up MongoDB:**
   - Create free account at https://mongodb.com/cloud/atlas
   - Create a cluster and get connection string

3. **Configure Environment:**
   - Create `.env.local` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Run Development Server:**
```bash
npm run dev
```

5. **Seed Sample Employees:**
   - Visit: http://localhost:3000/api/employees/seed
   - Or use: `curl -X POST http://localhost:3000/api/employees/seed`

6. **Access App:**
   - Employee Page: http://localhost:3000/attendance
   - Admin Dashboard: http://localhost:3000/admin

## 🚀 Deploy to Vercel (5 Minutes)

**See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for complete deployment guide!**

Quick steps:
1. Push code to GitHub
2. Import to Vercel
3. Add `MONGODB_URI` environment variable
4. Deploy! 🎉

Your app will be live at: `https://your-app.vercel.app`

## API Endpoints

- `GET /api/time` - Get server time
- `POST /api/attendance/submit` - Submit attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/export` - Export Excel
- `GET /api/employees` - Get employee list
- `POST /api/employees/seed` - Create sample employees

