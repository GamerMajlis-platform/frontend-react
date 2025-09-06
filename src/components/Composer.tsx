import { useEffect, useRef, useState } from "react";

interface ComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

export default function Composer({ onSend, placeholder = "Message..." }: ComposerProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.style.height = "auto";
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSend(text.trim());
        setText("");
      }
    }
  };

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-600 bg-[#071127] px-3 py-2 text-white placeholder-slate-400 resize-none h-12"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={() => {
            if (text.trim()) {
              onSend(text.trim());
              setText("");
            }
          }}
          className="px-4 py-2 rounded-xl bg-cyan-300 text-slate-900 font-bold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
