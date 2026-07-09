# Deployed Application Integration (Vercel + Backend Host)

This guide explains why the application fails to fetch results in production (deployed on Vercel) and provides a step-by-step solution to connect your deployed frontend to a deployed backend.

---

## Why It Fails in Deployed Version

1. **Frontend is Static**: 
   Vercel hosts the built React/Vite application as static assets (HTML, JS, CSS). It does not automatically run the Python Flask server.
2. **Missing Backend**:
   On `localhost`, Vite uses a local proxy (`vite.config.ts`) to forward `/api` requests to `http://localhost:5000`. In the production build on Vercel, this proxy does not exist.
3. **Route Rewrite to Index**:
   Because `Frontend/vercel.json` rewrites all unmatched requests to `/index.html` (necessary for React Router page reloads), any call to `/api/ai/disease/detect` returns the frontend's main HTML page instead of JSON data. The frontend tries to parse this HTML as JSON, fails, and displays the **"Request failed"** message.

---

## How to Fix (Step-by-Step)

To get the application working in production, you must **deploy the Python backend** to a platform that runs Python (e.g., Render or Railway) and configure Vercel to point to it.

### Step 1: Deploy the Backend to Render (Free & Recommended)

1. Sign up/Log in to [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository `fertismart1` (or specify the repository URL).
4. Configure the service settings:
   - **Name**: `ferti-smart-backend` (or similar)
   - **Environment**: `Python 3`
   - **Root Directory**: `Backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app`
5. Click **Deploy Web Service**.
6. Once deployed, Render will provide you with a public URL (e.g., `https://ferti-smart-backend.onrender.com`).

---

### Step 2: Configure Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/) and open your project.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-service-url.onrender.com` (use your actual Render web service URL)
4. Click **Save**.
5. Redeploy your frontend on Vercel so the environment variable is injected during the build.

---

### Step 3: Add `gunicorn` to Backend requirements.txt (Already Present)
The backend `requirements.txt` already contains `gunicorn==21.2.0`, which is the production-ready WSGI server used by Render and Railway to run Flask applications. No changes are required.
