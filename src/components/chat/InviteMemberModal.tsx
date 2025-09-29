import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import type { ChatRoom, ChatMember, OnlineUser } from "../../types/chat";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: ChatRoom;
  onMemberAdded: (member: ChatMember) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  room,
  onMemberAdded,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get online users
      const onlineUsers = await chatService.getOnlineUsers();

      // Filter out users who are already members
      const currentMemberIds = room.members?.map((m) => m.user.id) || [];
      const available = onlineUsers.filter(
        (user) => !currentMemberIds.includes(user.id)
      );

      setAvailableUsers(available);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat:errors.loadUsersFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [room.members, t]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    } else {
      // Reset state when modal closes
      setSearchQuery("");
      setError(null);
      setInviting(null);
    }
  }, [isOpen, loadAvailableUsers]);

  const handleInviteUser = async (
    userId: number,
    role: "MEMBER" | "MODERATOR" = "MEMBER"
  ) => {
    try {
      setInviting(userId);
      setError(null);

      const member = await chatService.addMember(room.id, userId, { role });
      onMemberAdded(member);

      // Remove user from available list
      setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));

      // Show success message briefly
      setTimeout(() => {
        if (availableUsers.length <= 1) {
          onClose();
        }
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat:errors.inviteUserFailed")
      );
    } finally {
      setInviting(null);
    }
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "🟢";
      case "AWAY":
        return "🟡";
      case "BUSY":
        return "🔴";
      case "IN_GAME":
        return "🎮";
      case "INVISIBLE":
        return "⚫";
      default:
        return "⚫";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-secondary rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700 text-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {t("chat:inviteMembers")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
              disabled={inviting !== null}
            >
              ✕
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("chat:searchUsers")}
              className="w-full px-4 py-2 pl-10 border border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-gray-200"
              disabled={loading || inviting !== null}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </div>

          {/* Room info */}
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <div className="text-sm text-gray-300">
              {t("chat:invitingTo")}:{" "}
              <span className="font-medium text-white">{room.name}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {room.currentMembers} / {room.maxMembers || "∞"}{" "}
              {t("chat:members")}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-3 bg-red-900/20 border-b border-red-700">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Users list */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">😴</div>
              <p className="text-gray-400">
                {searchQuery
                  ? t("chat:noUsersFound")
                  : t("chat:noAvailableUsers")}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {/* Avatar with status */}
                  <div className="relative flex-shrink-0">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white font-medium">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {getStatusIcon(user.status)}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {user.displayName}
                    </div>

                    <div className="text-sm text-gray-400">
                      {user.status === "IN_GAME" && user.currentGame ? (
                        <span>🎮 {user.currentGame}</span>
                      ) : (
                        <span>
                          {t(`chat:status.${user.status.toLowerCase()}`)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Invite buttons */}
                  <div className="flex-shrink-0 flex space-x-2">
                    {/* Invite as member */}
                    <button
                      onClick={() => handleInviteUser(user.id, "MEMBER")}
                      disabled={inviting !== null}
                      className="px-3 py-1 text-sm bg-primary text-dark rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
                      title={t("chat:inviteAsMember")}
                    >
                      {inviting === user.id ? "⏳" : t("chat:invite")}
                    </button>

                    {/* Invite as moderator (if current user is admin) */}
                    {room.creator.id === user.id && (
                      <button
                        onClick={() => handleInviteUser(user.id, "MODERATOR")}
                        disabled={inviting !== null}
                        className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
                        title={t("chat:inviteAsModerator")}
                      >
                        {inviting === user.id ? "⏳" : "🛡️"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-800">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>
              {filteredUsers.length} {t("chat:usersAvailable")}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
              disabled={inviting !== null}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
