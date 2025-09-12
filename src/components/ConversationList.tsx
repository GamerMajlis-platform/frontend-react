import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  updatedAt: string;
  unread?: number;
};

interface Props {
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations.filter((c) =>
      [c.name, c.lastMessage]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [conversations, query]);

  return (
    <aside className="w-full max-w-[360px] border-r border-slate-700 pr-3 md:pr-6 hidden md:block">
      <div className="sticky top-4">
        <div className="mb-3">
          <input
            aria-label={t("conversations.searchAria")}
            placeholder={t("conversations.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-600 bg-[#0f172a] px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedId === c.id ? "bg-slate-800" : "hover:bg-white/5"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                {(() => {
                  const first = (c.name || "").split(" ")[0] || "";
                  return first[0] ? first[0].toUpperCase() : "U";
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.updatedAt}</div>
                </div>
                <div className="text-sm text-slate-300 truncate">
                  {c.lastMessage}
                </div>
              </div>
              {c.unread ? (
                <div className="ml-2 text-sm bg-cyan-300 text-slate-900 rounded-full w-6 h-6 flex items-center justify-center">
                  {c.unread}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
