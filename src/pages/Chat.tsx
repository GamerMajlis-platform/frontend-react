import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/useAppContext";
import { AuthService } from "../services/AuthService";
import webSocketService from "../services/WebSocketService";
import type { ChatRoom as ChatRoomType } from "../types/chat";
import {
  ChatRoom,
  ChatRoomList,
  CreateRoomModal,
  OnlineUsersList,
} from "../components/chat";

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = AuthService.getStoredToken();
    if (!token || !user) return;

    // Connect to WebSocket for real-time chat
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(token);
        setIsConnected(true);
        console.log("Connected to chat WebSocket");
      } catch (error) {
        console.error("Failed to connect to chat WebSocket:", error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Listen for connection status changes
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    webSocketService.on("connected", handleConnected);
    webSocketService.on("disconnected", handleDisconnected);

    // Cleanup
    return () => {
      webSocketService.off("connected", handleConnected);
      webSocketService.off("disconnected", handleDisconnected);
    };
  }, [user]);

  useEffect(() => {
    // Subscribe to user's private message queue when connected
    if (isConnected && user) {
      webSocketService.subscribeToTopic(`/user/queue/private`);
      webSocketService.subscribeToTopic(`/topic/notifications/${user.id}`);
    }
  }, [isConnected, user]);

  const handleRoomSelect = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleRoomUpdate = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleRoomCreated = (room: ChatRoomType) => {
    setSelectedRoom(room);
    setShowCreateRoom(false);
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold mb-4">
            {t("chat.loginRequired", "Login Required")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t(
              "chat.loginDescription",
              "Please log in to access the chat system."
            )}
          </p>
          <a
            href="#/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t("auth.login", "Login")}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Connection Status */}
      <div
        className={`p-2 text-center text-sm ${
          isConnected
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {isConnected
          ? t("chat.connected", "Connected to chat")
          : t("chat.connecting", "Connecting to chat...")}
      </div>

      {/* Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Room List */}
        <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {t("chat.title", "Chat")}
              </h2>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors"
              >
                {t("chat.createRoom", "New Room")}
              </button>
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            <ChatRoomList
              selectedRoomId={selectedRoom?.id}
              onRoomSelect={handleRoomSelect}
            />
          </div>

          {/* Online Users */}
          <div className="border-t border-slate-700">
            <OnlineUsersList />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <ChatRoom room={selectedRoom} onRoomUpdate={handleRoomUpdate} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="text-6xl mb-6">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("chat.selectRoom", "Select a Chat Room")}
                </h3>
                <p className="text-gray-500">
                  {t(
                    "chat.selectRoomDescription",
                    "Choose a room from the sidebar to start chatting, or create a new room."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          isOpen={showCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </main>
  );
}
