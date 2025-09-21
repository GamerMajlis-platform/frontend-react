import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../../hooks/useClickOutside";

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className = "" }: ChatBotProps) {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; isBot: boolean; timestamp: Date }>
  >([
    {
      id: "welcome",
      text: t("chatbot.welcome", {
        defaultValue:
          "Hi! I'm the GamerMajlis Bot. How can I help you today? 🎮",
      }),
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modern infrastructure - useClickOutside hook replaces manual state management
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  // Simplified RTL detection using i18n.language
  const isRTL = i18n.language.startsWith("ar");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text: message,
        isBot: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Simulate bot typing and response
      setTimeout(() => {
        const responses = [
          "Great question! Let me help you with that. 🎯",
          "I'm here to assist with all your gaming needs! 🚀",
          "Thanks for reaching out! How else can I help? 💫",
          "Perfect! I've got some suggestions for you. ⚡",
          "Awesome! Let's make your gaming experience better! 🌟",
        ];

        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Enhanced Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 sm:w-96 md:w-[28rem] max-h-[32rem] bg-gradient-to-b from-slate-800/98 via-slate-700/98 to-slate-800/98 backdrop-blur-2xl rounded-3xl border border-slate-600/40 shadow-2xl overflow-hidden"
          dir={isRTL ? "rtl" : "ltr"}
          ref={chatRef}
        >
          {/* Decorative header elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-cyan-300/8 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Simplified Header - Just close button */}
          <div className="relative p-3 flex justify-end border-b border-slate-600/30">
            <button
              onClick={handleToggle}
              className="w-8 h-8 rounded-full bg-slate-600/40 hover:bg-slate-500/50 flex items-center justify-center transition-all duration-300 group border border-slate-500/30"
              aria-label={t("chatbot.close", { defaultValue: "Close chat" })}
            >
              <svg
                className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:rotate-90 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Enhanced Messages Area */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-500/50 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.isBot
                    ? isRTL
                      ? "flex-row-reverse"
                      : "flex-row"
                    : isRTL
                    ? "flex-row"
                    : "flex-row-reverse"
                } animate-fade-in opacity-0 animate-delay-${index * 100}`}
              >
                {msg.isBot && (
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <img
                      src="/brand/controller.png"
                      alt="GamerMajlis Bot"
                      className="h-6 w-auto drop-shadow-sm"
                      draggable={false}
                    />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1 max-w-[75%] ${
                    !msg.isBot && (isRTL ? "items-start" : "items-end")
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.isBot
                        ? "bg-slate-700/60 text-slate-100 border border-slate-600/30 backdrop-blur-sm"
                        : "bg-gradient-to-r from-primary to-cyan-300 text-slate-900 font-medium shadow-glow"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-500 px-2">
                    {msg.timestamp.toLocaleTimeString(i18n.language, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: !isRTL,
                    })}
                  </span>
                </div>

                {!msg.isBot && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-500 flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-slate-500/50">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src="/brand/controller.png"
                    alt="GamerMajlis Bot"
                    className="h-6 w-auto drop-shadow-sm"
                    draggable={false}
                  />
                </div>
                <div className="bg-slate-700/60 text-slate-100 border border-slate-600/30 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="p-4 border-t border-slate-600/30 bg-slate-800/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <div
                className={`flex-1 relative ${isRTL ? "order-2" : "order-1"}`}
              >
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("chatbot.placeholder", {
                    defaultValue: "Type your message...",
                  })}
                  className={`w-full bg-slate-700/60 border border-slate-600/40 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px] max-h-[120px] backdrop-blur-sm transition-all duration-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                  rows={1}
                />
                {/* Character count or input status */}
                {message.length > 0 && (
                  <div
                    className={`absolute bottom-1 text-xs text-slate-500 ${
                      isRTL ? "left-2" : "right-2"
                    }`}
                  >
                    {message.length}/500
                  </div>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`w-12 h-12 bg-gradient-to-r from-primary to-cyan-300 text-slate-900 rounded-xl font-medium hover:from-primary/90 hover:to-cyan-300/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow transform hover:scale-105 disabled:hover:scale-100 group ${
                  isRTL ? "order-1" : "order-2"
                }`}
                aria-label={t("chatbot.send", { defaultValue: "Send message" })}
              >
                <svg
                  className={`w-5 h-5 transform origin-center transition-transform duration-200 ${
                    isRTL ? "rotate-180" : "rotate-0"
                  } group-hover:scale-110`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {/* Quick Actions */}
            <div
              className={`flex gap-2 mt-3 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <button
                onClick={() =>
                  setMessage(
                    t("chatbot.quickHelp", {
                      defaultValue: "How can you help me?",
                    })
                  )
                }
                className="px-3 py-1.5 bg-slate-600/40 hover:bg-slate-500/50 text-slate-300 text-xs rounded-lg transition-all duration-200 border border-slate-500/30 hover:border-slate-400/50"
              >
                🤔 {t("chatbot.quickHelp", { defaultValue: "Help" })}
              </button>
              <button
                onClick={() =>
                  setMessage(
                    t("chatbot.quickTournaments", {
                      defaultValue: "Tell me about tournaments",
                    })
                  )
                }
                className="px-3 py-1.5 bg-slate-600/40 hover:bg-slate-500/50 text-slate-300 text-xs rounded-lg transition-all duration-200 border border-slate-500/30 hover:border-slate-400/50"
              >
                🏆{" "}
                {t("chatbot.quickTournaments", { defaultValue: "Tournaments" })}
              </button>
              <button
                onClick={() =>
                  setMessage(
                    t("chatbot.quickMarketplace", {
                      defaultValue: "Show me the marketplace",
                    })
                  )
                }
                className="px-3 py-1.5 bg-slate-600/40 hover:bg-slate-500/50 text-slate-300 text-xs rounded-lg transition-all duration-200 border border-slate-500/30 hover:border-slate-400/50"
              >
                🛒 {t("chatbot.quickMarketplace", { defaultValue: "Shop" })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Circular Chat Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 group relative overflow-hidden border-2 ${
          isOpen
            ? "bg-gradient-to-r from-slate-700/90 to-slate-600/90 border-primary/40 backdrop-blur-sm"
            : "bg-gradient-to-r from-primary to-cyan-300 hover:from-primary/90 hover:to-cyan-300/90 shadow-glow border-primary/20"
        }`}
        aria-label={t("chatbot.toggle")}
      >
        {/* Multiple background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-cyan-300/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-300/10 rounded-full animate-pulse" />

        {isOpen ? (
          <svg
            className="w-7 h-7 text-white relative z-10 group-hover:scale-125 group-hover:rotate-90 transition-all duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 text-slate-900 relative z-10 group-hover:scale-125 transition-transform duration-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
            <rect x="6" y="8" width="12" height="8" rx="2" ry="2" />
            <circle cx="9" cy="11" r="1" />
            <circle cx="15" cy="11" r="1" />
            <rect x="10" y="13" width="4" height="1" rx="0.5" ry="0.5" />
          </svg>
        )}

        {/* Activity indicator */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse border-2 border-slate-800 shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
        )}

        {/* Message count badge */}
        {!isOpen && messages.length > 1 && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800 shadow-lg">
            {Math.min(messages.length - 1, 9)}
          </div>
        )}
      </button>
    </div>
  );
}
