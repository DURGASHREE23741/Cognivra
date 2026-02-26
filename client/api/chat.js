/**
 * Vercel Serverless Function: /api/chat
 * Same logic as Express backend — calls Hugging Face so chat works on Vercel.
 */

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = process.env.HF_CHAT_MODEL || "meta-llama/Llama-3.2-3B-Instruct";

function buildMessages(message, history = []) {
  const recent = (history || []).slice(-5);
  const messages = recent.map(({ role, content }) => ({ role, content }));
  messages.push({ role: "user", content: message });
  return messages;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfiguration: missing HUGGINGFACE_API_KEY. Add it in Vercel → Settings → Environment Variables.",
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 503 && data?.estimated_time) {
        return res.status(503).json({
          error: "Model is loading. Please try again in a moment.",
          retryAfter: Math.ceil(data.estimated_time),
        });
      }
      if (response.status === 401) {
        return res.status(500).json({
          error: "Invalid API key. Use a token with 'Inference' permission at huggingface.co/settings/tokens.",
        });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: "AI service is busy. Please try again later." });
      }
      let msg =
        (data?.error && typeof data.error === "object" ? data.error.message : data?.error) ||
        data?.message ||
        "Failed to get response from AI.";
      if (typeof msg !== "string") msg = "Failed to get response from AI.";
      if (msg.includes("not supported by any provider")) {
        msg += " Enable providers at: huggingface.co/settings/inference-providers";
      }
      return res.status(response.status >= 400 ? response.status : 500).json({ error: msg });
    }

    const content = data?.choices?.[0]?.message?.content;
    const generatedText = typeof content === "string" ? content.trim() : "";

    return res.status(200).json({
      response: generatedText || "I couldn't generate a response. Please try again.",
    });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out. Please try again." });
    }
    console.error("[Cognivra] Hugging Face error:", err);
    return res.status(500).json({
      error: err.message || "Failed to get response from AI.",
    });
  }
}
