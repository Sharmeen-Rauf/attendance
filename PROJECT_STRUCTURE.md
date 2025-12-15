# 📁 Project Structure

```
attendance/
├── app/                          # Next.js App Router
│   ├── attendance/               # Employee attendance page
│   │   └── page.tsx             # Main attendance interface
│   ├── admin/                    # Admin dashboard
│   │   └── page.tsx             # Admin dashboard page
│   ├── components/               # React components
│   │   └── ServiceWorkerRegistration.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client functions
│   └── offlineStorage.ts        # Offline storage utilities
│
├── public/                       # Static files
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── backend/                      # Django backend
│   ├── attendance/               # Attendance app
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API views
│   │   ├── serializers.py       # DRF serializers
│   │   ├── urls.py              # URL routing
│   │   ├── admin.py             # Django admin
│   │   └── management/
│   │       └── commands/
│   │           └── create_sample_employees.py
│   │
│   ├── attendance_system/         # Django project settings
│   │   ├── settings.py          # Main settings
│   │   ├── urls.py              # Root URLs
│   │   └── wsgi.py              # WSGI config
│   │
│   ├── manage.py                 # Django management script
│   └── requirements.txt          # Python dependencies
│
├── scripts/                       # Utility scripts
│   ├── start-dev.sh             # Linux/Mac startup
│   └── start-dev.bat            # Windows startup
│
├── package.json                  # Node.js dependencies
├── next.config.js                # Next.js config
├── tsconfig.json                 # TypeScript config
├── README.md                     # Main documentation
├── SETUP.md                      # Detailed setup guide
├── QUICK_START.md                # Quick start guide
├── FEATURES.md                   # Features list
└── .gitignore                    # Git ignore rules

```

## Key Files Explained

### Frontend (Next.js)

- **`app/attendance/page.tsx`**: Main employee attendance page with buttons
- **`app/admin/page.tsx`**: Admin dashboard with filters and Excel export
- **`lib/api.ts`**: All API communication logic
- **`lib/offlineStorage.ts`**: Offline data storage and sync

### Backend (Django)

- **`backend/attendance/models.py`**: Employee and AttendanceRecord models
- **`backend/attendance/views.py`**: All API endpoints
- **`backend/attendance_system/settings.py`**: Django configuration

### Configuration

- **`next.config.js`**: Next.js and PWA settings
- **`backend/attendance_system/settings.py`**: Django, MongoDB, CORS settings

## Data Flow

1. **Employee clicks button** → `app/attendance/page.tsx`
2. **API call** → `lib/api.ts` → Django backend
3. **Backend processes** → `backend/attendance/views.py`
4. **Saves to MongoDB** → `backend/attendance/models.py`
5. **Returns response** → Frontend updates UI

## Offline Flow

1. **Action taken offline** → Saved to `localStorage`
2. **Connection restored** → Auto-sync triggered
3. **Pending actions sent** → Backend processes
4. **UI updated** → Success message shown

