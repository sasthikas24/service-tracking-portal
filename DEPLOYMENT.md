# Deployment Guide - Service Tracking Portal

## Problems Fixed

1. ✅ **"React is not defined" error** - Fixed by configuring JSX automatic transform in Vite
2. ✅ **404 API error** - Fix requires deploying Flask backend to Render

## Step 1: Deploy Backend to Render

### Create a Render Account & Web Service:

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `service-tracking-portal-backend`
   - **Environment**: Python 3
   - **Region**: Choose closest to you
   - **Build Command**: `pip install -r backend-flask/requirements.txt`
   - **Start Command**: `cd backend-flask && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app`
5. Add Environment Variables (Settings → Environment):
   ```
   FLASK_ENV=production
   JWT_SECRET_KEY=<your-secure-key-change-this>
   ```
6. Click **"Create Web Service"** and wait for deployment

### Get Your Backend URL:
Once deployed, Render will give you a URL like:
```
https://service-tracking-portal-backend.onrender.com
```
Copy this URL.

## Step 2: Update Frontend Environment Variables

### For Vercel Deployment:

1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add this variable:
   ```
   VITE_API_URL=https://service-tracking-portal-backend.onrender.com
   ```
4. Re-deploy your frontend (push to GitHub or click "Redeploy")

### For Local Development:

The `.env.local` file is already configured to use `http://localhost:5000`

## Step 3: Test the Backend Locally

```bash
# Terminal 1: Start Flask backend
cd backend-flask
python app.py

# Terminal 2: Start Frontend dev server
npm run dev
```

Test the login endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"Admin@123","role":"admin"}'
```

## Step 4: Rebuild Frontend

```bash
npm run build
```

Then commit and push to GitHub. Vercel will automatically redeploy.

---

## Troubleshooting

### Still getting 404 errors?
- Check that Render backend URL is correct
- Verify environment variable `VITE_API_URL` is set in Vercel
- Check Render logs to see if backend is running

### React still not defined?
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh Vercel deployment (Ctrl+Shift+R)

### CORS errors?
- The backend is configured to accept requests from:
  - `https://service-tracking-portal.vercel.app`
  - `https://*.vercel.app` (all preview deployments)
  - Local development servers

---

## Deployment Architecture

```
┌─────────────────────────┐
│   Vercel (Frontend)     │
│  React/Vite App         │───────┐
│  vercel.app             │       │ HTTPS
└─────────────────────────┘       │
                                  ▼
                        ┌──────────────────┐
                        │ Render (Backend) │
                        │ Flask API        │
                        │ onrender.com     │
                        └──────────────────┘
```

## Database Note

SQLite databases (`portal.db`, `database.db`) are stored locally in the backend-flask folder. 
On Render, each deployment gets a fresh database. For persistent data, consider:
- PostgreSQL addon on Render
- Or migrate to a cloud database service
