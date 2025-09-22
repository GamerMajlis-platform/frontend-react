import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface TypingUser {
  id: number;
  displayName: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className = "",
}) => {
  const { t } = useTranslation();
  const [dots, setDots] = useState("");

  // Animate typing dots
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingMessage = () => {
    if (typingUsers.length === 1) {
      return t("chat.userIsTyping", { name: typingUsers[0].displayName });
    } else if (typingUsers.length === 2) {
      return t("chat.twoUsersAreTyping", {
        name1: typingUsers[0].displayName,
        name2: typingUsers[1].displayName,
      });
    } else {
      return t("chat.multipleUsersAreTyping", {
        count: typingUsers.length,
      });
    }
  };

  return (
    <div className={`px-4 py-2 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Typing animation */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>

        {/* Typing message */}
        <div className="text-sm text-gray-500 italic">
          {getTypingMessage()}
          {dots}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
