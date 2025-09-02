interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className = "" }: ChatBotProps) {
  const handleChatClick = () => {
    // TODO: Implement chatbot functionality
    console.log("Chatbot clicked");
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <button
        onClick={handleChatClick}
        className="w-16 h-16 bg-[#6fffe9] hover:bg-[#5ee6d3] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
        aria-label="Open chatbot"
      >
        <svg
          className="w-8 h-8 text-slate-800 group-hover:scale-110 transition-transform duration-200"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Robot head */}
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
          {/* Robot body */}
          <rect x="6" y="8" width="12" height="10" rx="2" ry="2" />
          {/* Robot eyes */}
          <circle cx="9" cy="11" r="1" />
          <circle cx="15" cy="11" r="1" />
          {/* Robot mouth */}
          <rect x="10" y="14" width="4" height="1" rx="0.5" ry="0.5" />
          {/* Robot arms */}
          <rect x="4" y="10" width="2" height="4" rx="1" ry="1" />
          <rect x="18" y="10" width="2" height="4" rx="1" ry="1" />
          {/* Robot legs */}
          <rect x="8" y="18" width="2" height="3" rx="1" ry="1" />
          <rect x="14" y="18" width="2" height="3" rx="1" ry="1" />
        </svg>
      </button>
    </div>
  );
}
