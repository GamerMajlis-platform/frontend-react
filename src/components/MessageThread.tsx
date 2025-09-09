import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MessageBubble from "./MessageBubble";
import Composer from "./Composer";

type Message = {
  id: string;
  fromMe?: boolean;
  text: string;
  createdAt: string;
};

interface Props {
  conversationId?: string | null;
}

export default function MessageThread({ conversationId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      fromMe: false,
      text: "Hey! Are you joining tonight?",
      createdAt: "09:00",
    },
    {
      id: "2",
      fromMe: true,
      text: "Yes, I'll be there around 8.",
      createdAt: "09:02",
    },
  ]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // scroll to bottom on mount / new message
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, conversationId]);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: String(Date.now()),
      fromMe: true,
      text,
      createdAt: new Date().toLocaleTimeString(),
    };
    setMessages((m) => [...m, newMsg]);
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        {t("conversations.selectPrompt")}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            text={m.text}
            timestamp={m.createdAt}
            fromMe={m.fromMe}
          />
        ))}
      </div>

      <div className="border-t border-slate-700 p-4">
        <Composer onSend={handleSend} />
      </div>
    </div>
  );
}
