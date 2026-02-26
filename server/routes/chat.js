/**
 * Chat route: receives message + history, calls Hugging Face, returns response.
 * Includes simple in-memory rate limiting per IP.
 */
import { Router } from "express";
import axios from "axios";

const router = Router();
// Hugging Face Router API (api-inference.huggingface.co is deprecated)
const HF_BASE = "https://router.huggingface.co/v1";
const HF_CHAT_URL = `${HF_BASE}/chat/completions`;
// Default: smaller model that works on free tier; override with HF_CHAT_MODEL in .env
const HF_MODEL = process.env.HF_CHAT_MODEL || "meta-llama/Llama-3.2-3B-Instruct";

// Simple rate limit: max requests per window per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP
const requestCounts = new Map();

function getClientIP(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

function rateLimit(req, res, next) {
  const ip = getClientIP(req);
  const now = Date.now();
  let record = requestCounts.get(ip);
  if (!record) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    requestCounts.set(ip, record);
  }
  if (now >= record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  record.count += 1;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests. Please slow down.",
    });
  }
  next();
}

/**
 * Build messages array for OpenAI-compatible chat API (last 5 exchanges + current).
 */
function buildMessages(message, history = []) {
  const recent = history.slice(-5);
  const messages = recent.map(({ role, content }) => ({ role, content }));
  messages.push({ role: "user", content: message });
  return messages;
}

// Health check under /api so frontend can reach it via proxy
router.get("/health", (_, res) => res.json({ status: "ok", service: "cognivra" }));

/**
 * POST /api/chat
 * Body: { message: string, history: Array<{ role: 'user'|'assistant', content: string }> }
 */
router.post("/chat", rateLimit, async (req, res) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfiguration: missing HUGGINGFACE_API_KEY",
    });
  }

  const { message, history } = req.body || {};
  const text = typeof message === "string" ? message.trim() : "";
  const hist = Array.isArray(history) ? history : [];

  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  const messages = buildMessages(text, hist);

  try {
    const response = await axios.post(
      HF_CHAT_URL,
      {
        model: HF_MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    // OpenAI-style response: choices[0].message.content
    const data = response.data;
    const content = data?.choices?.[0]?.message?.content;
    const generatedText = typeof content === "string" ? content.trim() : "";

    return res.json({ response: generatedText || "I couldn't generate a response. Please try again." });
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;

    // Log for debugging (HF error body)
    console.error("[Cognivra] Hugging Face error:", status, data || err.message);

    if (status === 503 && data?.estimated_time) {
      return res.status(503).json({
        error: "Model is loading. Please try again in a moment.",
        retryAfter: Math.ceil(data.estimated_time),
      });
    }
    if (status === 401) {
      return res.status(500).json({ error: "Invalid API key. Use a token with 'Inference' permission at huggingface.co/settings/tokens." });
    }
    if (status === 429) {
      return res.status(429).json({ error: "AI service is busy. Please try again later." });
    }

    // Extract message from various API error shapes (OpenAI-style, HF, etc.)
    let msg =
      (data?.error && typeof data.error === "object" ? data.error.message : data?.error) ||
      data?.message ||
      err.message ||
      "Failed to get response from AI.";
    if (typeof msg !== "string") msg = "Failed to get response from AI.";
    if (msg.includes("not supported by any provider")) {
      msg += " Enable providers at: huggingface.co/settings/inference-providers";
    }
    return res.status(status && status >= 400 ? status : 500).json({ error: msg });
  }
});

export default router;
