# ⚡ Quick Deploy to Vercel (3 Steps!)

## Step 1: Get MongoDB Connection String (2 minutes)

1. Go to https://mongodb.com/cloud/atlas
2. Sign up (free) or log in
3. Create cluster → Click "Connect"
4. Choose "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database user password
7. **Save it securely!** You'll need it in Step 3

**Example format:**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Important:** Make sure in MongoDB Atlas:
- Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
- This allows Vercel to connect to your database

## Step 2: Push to GitHub (1 minute)

```bash
git init
git add .
git commit -m "Deploy attendance system"
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git push -u origin main
```

## Step 3: Deploy on Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click "Deploy"
4. Go to Settings → Environment Variables
5. Add new variable:
   - **Key**: `MONGODB_URI`
   - **Value**: (paste your MongoDB connection string here)
   - ✅ Check Production, Preview, and Development
6. Click "Save" and redeploy

**Done!** Your app is live at `https://your-app.vercel.app`

## Seed Employees

Visit: `https://your-app.vercel.app/api/employees/seed`

Or use curl:
```bash
curl -X POST https://your-app.vercel.app/api/employees/seed
```

## Access Your App

- **Employee Page**: `https://your-app.vercel.app/attendance`
- **Admin Dashboard**: `https://your-app.vercel.app/admin`

---

**That's it! Your attendance system is now live! 🎉**

