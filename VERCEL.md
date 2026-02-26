# Deploy Cognivra Frontend on Vercel

If you see **404: NOT_FOUND** after deploying, the project root is wrong. The frontend lives in the `client` folder.

## Fix 404 – set Root Directory

1. Open your project on [Vercel](https://vercel.com/dashboard).
2. Go to **Settings** → **General**.
3. Under **Root Directory**, click **Edit**.
4. Enter: **`client`**
5. Save and go to **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**.

Vercel will build from `client/` (Vite + React) and serve the `dist` output. The 404 should be gone.

---

## Chat needs a backend

The **server** (Node/Express) does not run on Vercel. To use the chatbot in production:

1. Deploy the **server** somewhere else (e.g. [Railway](https://railway.app) or [Render](https://render.com)):
   - Root: **`server`**
   - Build: `npm install`
   - Start: `npm start`
   - Add env: `HUGGINGFACE_API_KEY`

2. In Vercel, add an **Environment Variable**:
   - Name: **`VITE_API_BASE`**
   - Value: your backend URL (e.g. `https://your-app.onrender.com`)

3. Redeploy the frontend so the build picks up `VITE_API_BASE`. The app will then call your deployed API for chat.
