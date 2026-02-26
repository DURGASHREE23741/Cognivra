/**
 * Cognivra - AI Chatbot API Server
 * Production-ready Express server with chat and rate-limit support.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", service: "cognivra" }));

// Chat API
app.use("/api", chatRoutes);

// 404
app.use((_, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Cognivra API running on http://localhost:${PORT}`);
});
