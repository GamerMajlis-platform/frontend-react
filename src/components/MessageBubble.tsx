interface MessageBubbleProps {
  text: string;
  timestamp?: string;
  fromMe?: boolean;
}

export default function MessageBubble({ text, timestamp, fromMe = false }: MessageBubbleProps) {
  return (
    <div className={`max-w-[80%] ${fromMe ? "ml-auto text-right" : "mr-auto text-left"}`}>
      <div className={`inline-block rounded-xl p-3 ${fromMe ? "bg-cyan-300 text-black" : "bg-slate-700 text-white"}`}>
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
      {timestamp ? <div className="text-xs text-slate-400 mt-1">{timestamp}</div> : null}
    </div>
  );
}
