import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IoSend } from "react-icons/io5";

/**
 * Chat input with Enter to send and submit button.
 * Disabled while loading.
 */
export default function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const send = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSend(text);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Auto-resize textarea (optional, keep 1–4 lines)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-border bg-surface px-4 py-3"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-border bg-panel p-2 shadow-bubble focus-within:ring-1 focus-within:ring-neutral-500">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Cognivra..."
          rows={1}
          disabled={loading}
          className="min-h-[44px] max-h-[120px] w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-gray-100 placeholder-muted outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-600 text-white transition hover:bg-neutral-500 disabled:opacity-40 disabled:hover:bg-neutral-600"
          aria-label="Send"
        >
          <IoSend className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
