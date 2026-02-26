# Cognivra

Production-ready AI chatbot web app with a ChatGPT-style UI, conversation memory, and Hugging Face (Mistral) integration.

---

## Tech stack

| Layer   | Stack                          |
|--------|----------------------------------|
| Frontend | React, Vite, Tailwind CSS, Axios, Framer Motion, React Icons |
| Backend  | Node.js, Express, dotenv, CORS, Axios |
| AI       | Hugging Face Router API — `Qwen/Qwen2.5-7B-Instruct-1M` (override with `HF_CHAT_MODEL`) |

---

## Quick start

### 1. Clone / open project

```bash
cd cognivra
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env: set HUGGINGFACE_API_KEY (create at https://huggingface.co/settings/tokens with "Inference" permission)
npm install
npm run dev
```

Server runs at **http://localhost:5000**.

### 3. Frontend

In a new terminal:

```bash
cd cognivra/client
npm install
npm run dev
```

Client runs at **http://localhost:5174** and proxies `/api` to the backend.

### 4. Use the app

Open http://localhost:5174, type a message, and send. The last 5 exchanges are sent as context to the model.

---

## Env variables

**Server (`server/.env`)**

| Variable               | Required | Description                          |
|------------------------|----------|--------------------------------------|
| `HUGGINGFACE_API_KEY`  | Yes      | HF token with "Inference > Make calls to serverless Inference API" |
| `PORT`                 | No       | Port (default: 5000)                 |
| `HF_CHAT_MODEL`        | No       | Override model (default: Qwen/Qwen2.5-7B-Instruct-1M) |

**Client**

- Optional: `VITE_API_BASE` if you need to point to a different API URL (e.g. in production).

---

## Project structure

```
cognivra/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── routes/
│   │   └── chat.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Deploy

### Render

1. **Backend (Web Service)**  
   - New Web Service → connect repo, root: `cognivra/server`.  
   - Build: `npm install`.  
   - Start: `npm start`.  
   - Env: `HUGGINGFACE_API_KEY`, `NODE_ENV=production`.  
   - Note the backend URL (e.g. `https://cognivra-api.onrender.com`).

2. **Frontend (Static Site)**  
   - New Static Site → root: `cognivra/client`.  
   - Build: `npm install && npm run build`.  
   - Publish: `dist`.  
   - Env: `VITE_API_BASE=https://cognivra-api.onrender.com` (your backend URL).  
   - Redeploy after adding env so the build picks it up.

3. **CORS**  
   - Backend already uses `cors({ origin: true })`. For a specific domain, set `origin` to your frontend URL.

### Railway

1. **Backend**  
   - New Project → Deploy from repo.  
   - Root: `cognivra/server`.  
   - Build: `npm install`.  
   - Start: `npm start`.  
   - Variables: `HUGGINGFACE_API_KEY`, `PORT` (Railway often sets this).

2. **Frontend**  
   - New Service from same repo.  
   - Root: `cognivra/client`.  
   - Build: `npm install && npm run build`.  
   - Set `VITE_API_BASE` to the Railway backend URL.  
   - Use a static server (e.g. `npx serve dist`) or Railway’s static site preset.

3. **CORS**  
   - Same as Render: backend allows origins; restrict `origin` to your frontend URL if you prefer.

---

## Features

- ChatGPT-style UI: welcome screen, user (right) / AI (left) bubbles, dark theme.  
- Conversation memory: last 5 messages sent as context.  
- Typing indicator and auto-scroll.  
- Enter to send; input disabled while loading.  
- Simple rate limit (e.g. 30 req/min per IP).  
- API and network error handling with user-facing messages.

---

## Troubleshooting

| What you see | What to do |
|--------------|-------------|
| **Network Error** | Backend is not running. Start it: `cd cognivra/server && npm run dev` (must be on port 5000). |
| **500 / Invalid API key** | Set `HUGGINGFACE_API_KEY` in `server/.env`. Use a [fine-grained token](https://huggingface.co/settings/tokens) with **Inference > Make calls to the serverless Inference API**. |
| **500 / model or provider error** | Check the server terminal for `[Cognivra] Hugging Face error:`. Try another model in `.env`: e.g. `HF_CHAT_MODEL=meta-llama/Llama-3.2-3B-Instruct`. |

---

## API

**POST `/api/chat`**

- Body: `{ "message": "string", "history": [ { "role": "user"|"assistant", "content": "string" } ] }`  
- Response: `{ "response": "string" }`  
- Errors: 400 (validation), 429 (rate limit / HF busy), 503 (model loading).

---

## License

MIT.
