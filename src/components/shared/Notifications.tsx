import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { webSocketService } from "../../services/WebSocketService";
import type { NotificationMessage } from "../../services/WebSocketService";
import { useAppContext } from "../../context/useAppContext";
import SessionService from "../../services/SessionService";
// theme constants intentionally not needed here

export default function Notifications() {
  const { user, isAuthenticated } = useAppContext();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // keep notifications dropdown right-aligned to avoid floating off-screen

  const handleIncoming = useCallback((n: NotificationMessage) => {
    setNotifications((prev) => [n, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = SessionService.getStoredToken();
    if (!token) return;

    let mounted = true;

    webSocketService
      .connect(token)
      .then(() => {
        if (!mounted) return;
        webSocketService.subscribeToTopic(`/topic/notifications/${user.id}`);
      })
      .catch(() => {
        /* ignore connection errors for notifications */
      });

    webSocketService.on("notification", handleIncoming);

    return () => {
      mounted = false;
      webSocketService.off("notification", handleIncoming);
      webSocketService.unsubscribeFromTopic(`/topic/notifications/${user?.id}`);
    };
  }, [isAuthenticated, user, handleIncoming]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  function openPanel() {
    setOpen((v) => {
      const next = !v;
      if (!v) {
        // mark all as read locally when opening
        setNotifications((prev) => prev.map((p) => ({ ...p, isRead: true })));
      }
      return next;
    });
  }

  function onNotificationClick(n: NotificationMessage) {
    // Try to navigate based on data payload
    const d = n.data as Record<string, unknown> | undefined;
    if (d && typeof d === "object") {
      if (d.postId) {
        navigate(String(`/post/${d.postId}`));
        return;
      }
      if (d.userId) {
        navigate(String(`/profile/${d.userId}`));
        return;
      }
    }
    // fallback: navigate to home
    navigate("/");
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-label="Notifications"
        onClick={openPanel}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a4 4 0 00-4 4v2.586L4.293 11.293A1 1 0 004.707 13h10.586a1 1 0 00.414-1.707L14 8.586V6a4 4 0 00-4-4zM7 16a3 3 0 006 0H7z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-2xl z-50 p-2">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-700/30 mb-2">
            <strong className="text-sm text-white">Notifications</strong>
            <button
              className="text-xs text-slate-300 hover:text-white"
              onClick={() => setNotifications([])}
            >
              Clear
            </button>
          </div>

          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-4 text-sm text-slate-300">No notifications</div>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => onNotificationClick(n)}
                className={`w-full text-left px-3 py-2 flex gap-3 items-start hover:bg-white/3 rounded-md transition-colors ${
                  n.isRead ? "" : "bg-white/2"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white">
                  🔔
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {n.title}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {n.message}
                  </div>
                </div>
                <div className="text-xs text-slate-400 ml-2">
                  {new Date(n.timestamp).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
