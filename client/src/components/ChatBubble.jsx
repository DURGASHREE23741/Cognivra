import { motion } from "framer-motion";

/**
 * Single message bubble — user (right) or assistant (left).
 */
export default function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full px-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-bubble ${
          isUser
            ? "bg-neutral-700 text-white rounded-br-md"
            : "bg-panel border border-border text-gray-100 rounded-bl-md"
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</p>
      </div>
    </motion.div>
  );
}
