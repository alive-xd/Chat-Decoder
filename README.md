# Chat Decoder — Deployment Guide

Follow these step-by-step instructions to deploy the Chat Decoder monorepo to production using **Railway** (backend) and **Vercel** (frontend).

---

## Step 1: Push the Monorepo to GitHub
1. Create a new repository on GitHub (it can be public or private, as all credentials/secrets are excluded via `.gitignore`).
2. Initialize git in your local root directory (if not already done) and push the code:
   ```bash
   git init
   git add .
   git commit -m "Initialize deployment config"
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy the Backend to Railway
1. Log into your [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**, and select your repository.
3. In the setup dialog, configure the following settings:
   * **Root Directory**: `backend/`
4. Add the following **Environment Variables** in the Railway variables tab:
   * `GEMINI_API_KEY`: Your Google Gemini API key (starts with `AIzaSy`).
   * `SESSION_SECRET`: A secure random string used to encrypt session tokens (e.g. any long random key).
   * `CORS_ORIGIN`: Set this to `https://your-vercel-app.vercel.app` (you can update this in the next step once Vercel generates your frontend URL).
5. Railway will automatically detect the `railway.toml` config, build your FastAPI backend, and generate a public URL (e.g., `https://your-railway-backend.up.railway.app`). Note this backend URL.

---

## Step 3: Deploy the Frontend to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**, and import the same GitHub repository.
3. In the project configuration dialog:
   * **Root Directory**: Select `frontend` (Vercel will auto-detect Next.js framework).
4. Expand the **Environment Variables** section and add:
   * `NEXT_PUBLIC_API_URL`: Set this to the public Railway backend URL generated in Step 2 (e.g. `https://your-railway-backend.up.railway.app`).
5. Click **Deploy**. Vercel will build and launch your frontend, generating a public URL (e.g., `https://chat-decoder.vercel.app`). Note this URL.

---

## Step 4: Update CORS_ORIGIN on Railway
Once Vercel has generated your frontend site URL:
1. Go back to your project in the **Railway Dashboard**.
2. Select your backend service and click the **Variables** tab.
3. Update the value of `CORS_ORIGIN` to match your Vercel frontend domain (e.g., `https://chat-decoder.vercel.app`).
4. Railway will automatically redeploy the backend with the updated CORS origin allowed.
