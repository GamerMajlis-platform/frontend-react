import { useState, useEffect } from "react";
import "../styles/customStyles.css";
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
  RoomSuggestions,
} from "../components/chat";
import { SearchDMs } from "../components/chat";
import { chatService } from "../services/ChatService";
import useIsMobile from "../hooks/useIsMobile";

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState<"ROOMS" | "DIRECT">("ROOMS");
  const [roomsRefreshCounter, setRoomsRefreshCounter] = useState(0);
  const isMobile = useIsMobile();

  // Sidebar renderer - can be used as the left column on desktop or as the
  // dedicated full-screen rooms screen on mobile (when no room is selected).
  const renderSidebar = (fullWidth = false) => (
    <div
      className={
        fullWidth
          ? "w-full flex flex-col bg-dark-secondary border-slate-600 min-h-0"
          : "w-80 min-w-[20rem] border-r flex flex-col bg-dark-secondary border-slate-600 min-h-0"
      }
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>{/* header text removed per request */}</div>

          <div className="flex items-center space-x-2">
            <div className="rounded-md bg-slate-800 p-1 flex items-center">
              <button
                onClick={() => {
                  setView("ROOMS");
                  setSelectedRoom((prev) =>
                    prev && prev.type === "DIRECT_MESSAGE" ? null : prev
                  );
                }}
                className={`px-3 py-1 text-sm rounded ${
                  view === "ROOMS"
                    ? "bg-primary text-black"
                    : "text-gray-300 hover:bg-slate-700"
                }`}
              >
                {t("chat:rooms", "Rooms")}
              </button>
              <button
                onClick={() => {
                  setView("DIRECT");
                  setSelectedRoom((prev) =>
                    prev && prev.type !== "DIRECT_MESSAGE" ? null : prev
                  );
                }}
                className={`ml-1 px-3 py-1 text-sm rounded ${
                  view === "DIRECT"
                    ? "bg-primary text-black"
                    : "text-gray-300 hover:bg-slate-700"
                }`}
              >
                {t("chat:directs", "DMs")}
              </button>
            </div>

            {view !== "DIRECT" ? (
              <button
                onClick={() => setShowCreateRoom(true)}
                className="create-room-plus text-white text-3xl font-bold px-2 -mt-0.5 hover:text-gray-200 transition-colors focus:outline-none leading-none"
                aria-label={t("chat:createRoom", "New Room")}
                title={t("chat:createRoom", "New Room")}
              >
                +
              </button>
            ) : (
              // invisible placeholder (same inline spacing) to preserve header spacing when switching views
              <div
                className="px-2 -mt-0.5 opacity-0 pointer-events-none"
                aria-hidden="true"
              >
                +
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <ChatRoomList
          selectedRoomId={selectedRoom?.id}
          onRoomSelect={handleRoomSelect}
          view={view}
          refreshKey={roomsRefreshCounter}
        />
      </div>

      {/* Online Users / Suggestions / Search */}
      <div className="border-t border-slate-700">
        {view === "ROOMS" ? (
          <RoomSuggestions
            refreshKey={roomsRefreshCounter}
            onRoomJoined={(room) => setSelectedRoom(room)}
            selectedRoomId={selectedRoom?.id}
          />
        ) : (
          <div className="px-3 py-2 text-xs text-gray-500">
            {t("chat:directsPlaceholder", "Direct messages view")}
          </div>
        )}
        {/* Search box for starting DMs - available in both views */}
        <div className="border-t border-slate-700">
          <SearchDMs onStartDirectMessage={handleStartDirectMessage} />
        </div>
      </div>
      <div className="border-t border-slate-700">
        <OnlineUsersList onStartDirectMessage={handleStartDirectMessage} />
      </div>
    </div>
  );

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
    // try to join the newly created room (ensure creator is member)
    (async () => {
      try {
        await chatService.joinRoom(room.id);
      } catch {
        console.warn("joinRoom failed");
      } finally {
        setRoomsRefreshCounter((c) => c + 1);
      }
    })();
  };

  const handleStartDirectMessage = async (recipientId: number) => {
    let dmRoom: ChatRoomType | null = null;
    try {
      dmRoom = await chatService.startDirectMessage({ recipientId });
      setSelectedRoom(dmRoom);
      setView("DIRECT");

      // attempt to join so it shows up in user's rooms
      try {
        await chatService.joinRoom(dmRoom.id);
      } catch (e) {
        console.debug("joinRoom failed for DM (non-fatal)", e);
      }

      // Immediately trigger a refresh key to reload lists
      setRoomsRefreshCounter((c) => c + 1);

      // Give backend a brief moment to persist and then verify the room appears
      // If it does, ensure it's selected; if not, refresh again once.
      setTimeout(async () => {
        try {
          const resp = await chatService.getUserRooms({ page: 0, size: 50 });
          const found = (resp.chatRooms || []).some((r) => r.id === dmRoom?.id);
          if (found) {
            setSelectedRoom(dmRoom);
            setRoomsRefreshCounter((c) => c + 1);
          } else {
            // Try one more forced refresh
            setRoomsRefreshCounter((c) => c + 1);
          }
        } catch (e) {
          console.debug("Failed to verify DM in user rooms", e);
          setRoomsRefreshCounter((c) => c + 1);
        }
      }, 500);
    } catch (e) {
      console.error("Failed to start direct message:", e);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold mb-4">
            {t("chat:loginRequired", "Login Required")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t(
              "chat:loginDescription",
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
    <main className="h-screen flex flex-col bg-dark text-white chat-root">
      {/* Chat Layout */}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Room List (desktop only). For mobile we render the
            same sidebar content as the dedicated mobile screen inside the main
            area when no room is selected. */}
        {!isMobile && renderSidebar(false)}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-independence min-h-0">
          {isMobile ? (
            // Mobile: dedicated single-pane flow. When no room is selected show
            // the full sidebar (rooms/DMs/search/suggestions). When a room is
            // selected, show the existing ChatRoom component full-screen with
            // a back button.
            selectedRoom ? (
              <ChatRoom
                room={selectedRoom}
                onRoomUpdate={handleRoomUpdate}
                onRoomDeleted={(roomId) => {
                  if (selectedRoom?.id === roomId) setSelectedRoom(null);
                  setRoomsRefreshCounter((c) => c + 1);
                }}
                onBack={() => setSelectedRoom(null)}
                showBack={true}
              />
            ) : (
              // Render the sidebar content as the dedicated mobile screen
              renderSidebar(true)
            )
          ) : // Desktop: existing split view
          selectedRoom ? (
            <ChatRoom
              room={selectedRoom}
              onRoomUpdate={handleRoomUpdate}
              onRoomDeleted={(roomId) => {
                if (selectedRoom?.id === roomId) setSelectedRoom(null);
                setRoomsRefreshCounter((c) => c + 1);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-200 px-6">
                <div className="text-6xl mb-6">💬</div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("chat:selectRoom", "Select a Chat Room")}
                </h3>
                <p className="text-gray-300 max-w-lg mx-auto">
                  {t(
                    "chat:selectRoomDescription",
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
