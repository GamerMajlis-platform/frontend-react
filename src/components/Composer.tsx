import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

export default function Composer({ onSend, placeholder }: ComposerProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // keep focus behavior consistent if needed in future
  useEffect(() => {
    // no-op: single line input, no auto-resize
  }, [text]);

  const send = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="w-full flex items-center gap-2">
      {/* Hidden file input for attachments */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        aria-label={t("conversations.composer.attach")}
        title={t("conversations.composer.attach")}
        onChange={() => {
          // Placeholder: handle selected file(s) here
        }}
      />

      <input
        ref={textRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          typeof placeholder === "string"
            ? placeholder
            : t("conversations.composer.placeholder")
        }
        className="flex-1 h-12 rounded-xl border border-slate-600 bg-[#071127] px-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300"
        type="text"
      />

      {/* Attach icon button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex h-12 w-12 items-center justify-center text-cyan-300 hover:text-cyan-200 active:scale-[0.98] transition"
        aria-label={t("conversations.composer.attach")}
        title={t("conversations.composer.attach")}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 6.5l-7.78 7.78a3 3 0 11-4.24-4.24L12.5 3.8a4.5 4.5 0 016.36 6.36l-8.49 8.5a6 6 0 11-8.49-8.49L11 1.96"
            stroke="#67e8f9"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Send button */}
      <button
        type="button"
        onClick={send}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-300 px-3 text-slate-900 font-semibold hover:bg-cyan-200 active:scale-[0.98] transition"
        aria-label={t("conversations.composer.send")}
        title={t("conversations.composer.send")}
      >
        {/* send icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 2L11 13"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 2l-7 20-4-9-9-4 20-7z"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline text-sm">
          {t("conversations.composer.send")}
        </span>
      </button>
    </div>
  );
}
