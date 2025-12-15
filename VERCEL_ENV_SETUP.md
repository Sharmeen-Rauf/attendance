# 🔐 Vercel Environment Variable Setup

## Quick Setup for Your MongoDB

When deploying to Vercel, you need to add your MongoDB connection string as an environment variable.

### Get Your MongoDB Connection String:

1. Go to MongoDB Atlas: https://mongodb.com/cloud/atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

**Example format:**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Never commit your connection string to GitHub!**

## Steps to Add in Vercel:

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project

2. **Navigate to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in the sidebar

3. **Add New Variable**
   - Click "Add New" button
   - **Key**: `MONGODB_URI`
   - **Value**: (paste your MongoDB connection string here - get it from MongoDB Atlas)

4. **Select Environments**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Check all three!)

5. **Save**
   - Click "Save"
   - Vercel will ask to redeploy - click "Redeploy"

## After Adding:

1. **Wait for redeploy** (usually 1-2 minutes)
2. **Test your app:**
   - Visit: `https://your-app.vercel.app/api/employees/seed`
   - This will create sample employees
3. **Access attendance page:**
   - Visit: `https://your-app.vercel.app/attendance`

## Verify It's Working:

✅ **Check deployment logs:**
- Go to Deployments → Latest deployment → Functions
- Look for "✅ MongoDB connection configured" in logs

✅ **Test API:**
- Visit: `https://your-app.vercel.app/api/employees`
- Should return employee list (or empty array if not seeded)

✅ **Seed employees:**
- Visit: `https://your-app.vercel.app/api/employees/seed`
- Should return success message

## Troubleshooting:

**If connection fails:**
1. Check MongoDB Atlas → Network Access
2. Make sure IP `0.0.0.0/0` is whitelisted (allows all IPs)
3. Verify username/password in connection string
4. Check Vercel function logs for error messages

**If environment variable not found:**
1. Make sure you added it for all environments (Production, Preview, Development)
2. Redeploy after adding the variable
3. Check variable name is exactly `MONGODB_URI` (case-sensitive)

---

**Once added, your app will connect to MongoDB automatically! 🚀**

