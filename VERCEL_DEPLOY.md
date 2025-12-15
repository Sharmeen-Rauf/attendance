# 🚀 Deploy to Vercel - Complete Guide

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free)
2. **MongoDB Atlas Account**: Sign up at https://mongodb.com/cloud/atlas (free tier available)
3. **GitHub Account**: For easy deployment

## Step 1: Set Up MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (FREE tier is fine)
4. Create a database user:
   - Database Access → Add New User
   - Username: `attendance_user`
   - Password: (generate secure password, save it!)
5. Whitelist IP addresses:
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://attendance_user:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/attendance-system.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables:**
   - In Vercel project settings → Environment Variables
   - Add: `MONGODB_URI` = your MongoDB connection string
   - Make sure to add it for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live! 🎉

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variable:**
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string when prompted
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Step 3: Seed Sample Employees

After deployment, visit:
```
https://your-app.vercel.app/api/employees/seed
```

Or use curl:
```bash
curl -X POST https://your-app.vercel.app/api/employees/seed
```

This will create 5 sample employees for testing.

## Step 4: Access Your App

- **Employee Page**: `https://your-app.vercel.app/attendance`
- **Admin Dashboard**: `https://your-app.vercel.app/admin`
- **Home**: `https://your-app.vercel.app`

## Environment Variables in Vercel

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |

**Important:** 
- Add the same variable for Production, Preview, and Development
- After adding, redeploy your app

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Your app will be available at your domain!

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### MongoDB Connection Error
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist
- Ensure database user password is correct
- Check network access in MongoDB Atlas

### API Routes Not Working
- Ensure routes are in `app/api/` directory
- Check Vercel function logs
- Verify MongoDB connection

### Employees Not Loading
- Run the seed endpoint: `/api/employees/seed`
- Check MongoDB collection exists
- Verify connection string

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string saved
- [ ] Environment variable set in Vercel
- [ ] App deployed successfully
- [ ] Sample employees seeded
- [ ] Tested attendance flow
- [ ] Tested admin dashboard
- [ ] Tested Excel export

## Support

If you face any issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Verify environment variables
4. Test API endpoints directly

## Next Steps

1. **Add Real Employees**: Create API endpoint or use MongoDB directly
2. **Customize Settings**: Update office time, grace period in code
3. **Add Authentication**: Secure admin dashboard
4. **Analytics**: Add usage tracking
5. **Notifications**: Add email/SMS alerts

---

**Your attendance system is now live and accessible to everyone! 🎉**

