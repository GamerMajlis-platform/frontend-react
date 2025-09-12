import { memo } from "react";

interface MessageBubbleProps {
  text: string;
  timestamp?: string;
  fromMe?: boolean;
}

function MessageBubble({
  text,
  timestamp,
  fromMe = false,
}: MessageBubbleProps) {
  return (
    <div
      className={`max-w-[80%] ${
        fromMe ? "ml-auto text-right" : "mr-auto text-left"
      }`}
    >
      <div
        className={`inline-block p-3 ${
          fromMe
            ? "bg-cyan-300 text-black rounded-2xl rounded-br-sm"
            : "bg-slate-700 text-white rounded-2xl rounded-bl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
      {timestamp ? (
        <div className="text-xs text-slate-400 mt-1">{timestamp}</div>
      ) : null}
    </div>
  );
}

export default memo(MessageBubble);
