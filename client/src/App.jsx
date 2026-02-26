import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "./api.js";
import ChatBubble from "./components/ChatBubble.jsx";
import ChatInput from "./components/ChatInput.jsx";
import TypingIndicator from "./components/TypingIndicator.jsx";

const MAX_HISTORY = 5; // Send last 5 exchanges as context
const STORAGE_KEY = "cognivra_user_name";

function NameForm({ onSubmit }) {
  const [name, setName] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name);
  };
  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-white placeholder-muted outline-none focus:ring-1 focus:ring-neutral-500"
        autoFocus
      />
      <button
        type="submit"
        className="mt-3 w-full rounded-xl bg-neutral-600 py-3 font-medium text-white transition hover:bg-neutral-500"
      >
        Continue
      </button>
    </form>
  );
}

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [showNamePrompt, setShowNamePrompt] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // After login: show "Hello [Name]!" as first message (ChatGPT-style)
  useEffect(() => {
    if (userName && messages.length === 0) {
      setMessages([{ role: "assistant", content: `Hello ${userName}! How can I assist you today?` }]);
    }
  }, [userName]);

  // Auto-scroll to bottom when messages or loading state change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleNameSubmit = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setUserName(trimmed);
    setShowNamePrompt(false);
  };

  const sendMessage = async (text) => {
    setError(null);
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const context = history.slice(-MAX_HISTORY * 2);

    try {
      const { data } = await api.post("/api/chat", {
        message: text,
        history: context,
      });
      const response = data?.response ?? "No response.";
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      const isNetworkError = err.code === "ERR_NETWORK" || err.message === "Network Error";
      const raw = err.response?.data?.error;
      const msg = isNetworkError
        ? "Can't reach the server. Start the backend with: cd cognivra/server && npm run dev"
        : (typeof raw === "string" ? raw : raw?.message) ||
          err.message ||
          "Something went wrong. Please try again.";
      setError(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  // First-time: ask for name (ChatGPT-style profile)
  if (showNamePrompt) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <header className="shrink-0 border-b border-border bg-panel px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <span className="text-xl font-semibold text-white">Cognivra</span>
            <span className="text-sm text-muted">AI Chat</span>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Welcome! What should we call you?
            </h1>
            <p className="mt-2 text-muted-light">Enter your name to get started.</p>
            <NameForm onSubmit={handleNameSubmit} />
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-panel px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="text-xl font-semibold text-white">Cognivra</span>
          <span className="text-sm text-muted">AI Chat</span>
          {userName && (
            <span className="ml-auto text-sm text-muted-light">Hi, {userName}</span>
          )}
        </div>
      </header>

      {/* Main area: chat with optional welcome */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto">
          {!hasMessages ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center px-4 py-16 text-center"
            >
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                What can I help you with?
              </h1>
              <p className="mt-2 max-w-md text-muted-light">
                Ask anything. I’ll give you clear, helpful answers.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4 py-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} role={msg.role} content={msg.content} />
                ))}
              </AnimatePresence>
              {loading && <TypingIndicator />}
            </div>
          )}
        </div>

        {error && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 text-center text-sm text-amber-400"
          >
            {error}
          </motion.p>
        )}

        <ChatInput onSend={sendMessage} loading={loading} />
      </main>
    </div>
  );
}
