# How to Connect Hugging Face API to Cognivra

## Step 1: Create a Hugging Face account (if you don’t have one)

1. Go to **https://huggingface.co/join**
2. Sign up with email or Google/GitHub.

---

## Step 2: Create an API token with Inference permission

1. Open **https://huggingface.co/settings/tokens**
2. Click **“Create new token”** or **“New token”**.
3. Choose **“Fine-grained”** (recommended) or **“Write”** (classic).
4. **Name:** e.g. `Cognivra` (any name is fine).
5. **Permissions:** enable:
   - **Inference** → **“Make calls to the serverless Inference API”**  
   (or the option that mentions “Inference API” / “Inference Providers”.)
6. Click **Create** and **copy the token** (it starts with `hf_...`).  
   You won’t see it again, so save it somewhere safe.

---

## Step 3: Put the token in your project

1. Open the file: **`cognivra/server/.env`**
2. Find the line:  
   `HUGGINGFACE_API_KEY=your_key_here`
3. Replace `your_key_here` with your token (no quotes, no spaces):

   ```env
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Save the file.

---

## Step 4: Restart the backend

1. In the terminal where the server is running, stop it (**Ctrl+C**).
2. Start it again:

   ```bash
   cd cognivra/server
   npm run dev
   ```

3. In the browser, open **http://localhost:5174** and send a message.

If the token and permission are correct, the “Invalid API key” error will go away and the chatbot will reply.

---

## Quick links

| What              | Link |
|-------------------|------|
| Create token      | https://huggingface.co/settings/tokens |
| Token permissions | https://huggingface.co/settings/tokens/new (choose Fine-grained, enable Inference) |
