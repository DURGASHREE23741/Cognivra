# Deploy Cognivra on Vercel (frontend + API)

The **client** folder has both the React app and a **serverless API** (`api/chat.js`), so the full chatbot can run on Vercel with no separate backend.

## 1. Fix 404 – set Root Directory

1. Open your project on [Vercel](https://vercel.com/dashboard).
2. Go to **Settings** → **Build and Deployment**.
3. Under **Root Directory**, click **Edit** → enter **`client`** → Save.
4. **Redeploy**: Deployments → **⋯** on latest → **Redeploy**.

Vercel will build the frontend and deploy the `/api/chat` serverless function from `client/api/chat.js`.

## 2. Add Hugging Face API key (required for chat)

1. In Vercel: **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `HUGGINGFACE_API_KEY`
   - **Value:** your token (from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens), with **Inference** permission)
3. Save and **Redeploy** so the API function gets the variable.

After redeploying, the site and chat should work on the same Vercel URL (no separate backend needed).
