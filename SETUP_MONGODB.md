# 🔧 MongoDB Setup Guide

## Get Your Connection String

1. Go to MongoDB Atlas: https://mongodb.com/cloud/atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

**Example format:**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## ✅ Local Development

Create a `.env.local` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string_here
```

**To test locally:**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Seed sample employees:**
   - Visit: http://localhost:3000/api/employees/seed
   - Or use curl: `curl -X POST http://localhost:3000/api/employees/seed`

3. **Test the app:**
   - Employee page: http://localhost:3000/attendance
   - Admin dashboard: http://localhost:3000/admin

## 🚀 For Vercel Deployment

When deploying to Vercel, add this environment variable:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `MONGODB_URI`
   - **Value**: (paste your MongoDB connection string from MongoDB Atlas)
4. Make sure to add it for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Redeploy your app

## 🔒 Security Notes

⚠️ **Important:**
- Your `.env.local` file is in `.gitignore` (won't be committed to GitHub)
- For Vercel, add the connection string as an environment variable (not in code)
- Never commit connection strings to GitHub!

## 🧪 Test Connection

To verify your MongoDB connection works:

1. **Run the app locally:**
   ```bash
   npm run dev
   ```

2. **Check if employees load:**
   - Visit: http://localhost:3000/attendance
   - You should see employee dropdown

3. **If you see errors:**
   - Check MongoDB Atlas IP whitelist (should allow 0.0.0.0/0 for Vercel)
   - Verify username/password are correct
   - Check network access in MongoDB Atlas

## 📝 Next Steps

1. ✅ MongoDB connection configured
2. ⏭️ Test locally (`npm run dev`)
3. ⏭️ Seed employees (`/api/employees/seed`)
4. ⏭️ Deploy to Vercel (add `MONGODB_URI` environment variable)
5. ⏭️ Share the link with your team!

---

**Your MongoDB is ready to use! 🎉**

