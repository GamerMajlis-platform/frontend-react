import { useState } from "react";
import { ConversationList, MessageThread } from "../components";

export default function MessagesPage() {
  const [selected, setSelected] = useState<string | null>("1");

  const conversations = [
    { id: "1", name: "Ali Ahmed", lastMessage: "See you there!", updatedAt: "09:02", unread: 0 },
    { id: "2", name: "Sara", lastMessage: "Sent the files.", updatedAt: "08:25", unread: 2 },
    { id: "3", name: "Gaming Group", lastMessage: "Tournament starts now", updatedAt: "07:50", unread: 0 },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6">
        <ConversationList conversations={conversations} selectedId={selected} onSelect={(id) => setSelected(id)} />
        <div className="bg-transparent rounded-lg border border-slate-700 flex flex-col h-[70vh]">
          <MessageThread conversationId={selected} />
        </div>
      </div>
    </main>
  );
}
// ...removed placeholder export
