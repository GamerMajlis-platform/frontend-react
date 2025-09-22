import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import { useAppContext } from "../../context/useAppContext";
import type { ChatMember, ChatRoom } from "../../types/chat";

interface MemberListProps {
  room: ChatRoom;
  onMemberRemoved?: (memberId: number) => void;
  className?: string;
}

export const MemberList: React.FC<MemberListProps> = ({
  room,
  onMemberRemoved,
  className = "",
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getMembers(room.id, {
        page: 0,
        size: 100,
      });
      setMembers(response.members);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat.errors.loadMembersFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [room.id, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRemoveMember = async (memberId: number) => {
    if (!canRemoveMember(memberId)) return;

    try {
      setRemovingMemberId(memberId);
      await chatService.removeMember(room.id, memberId);

      // Update local state
      setMembers((prev) => prev.filter((m) => m.user.id !== memberId));

      // Notify parent component
      if (onMemberRemoved) {
        onMemberRemoved(memberId);
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const canRemoveMember = (memberId: number) => {
    if (!user) return false;

    // Can't remove yourself
    if (memberId === user.id) return false;

    // Only moderators can remove members
    return chatService.isUserModerator(room, user.id);
  };

  const getMemberRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "👑";
      case "MODERATOR":
        return "🛡️";
      default:
        return "";
    }
  };

  const getMemberStatusColor = (isOnline: boolean | undefined) => {
    if (isOnline === undefined) return "bg-gray-400";
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "";

    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("chat.justNow");
    if (diffInMinutes < 60)
      return t("chat.minutesAgo", { count: diffInMinutes });
    if (diffInMinutes < 1440)
      return t("chat.hoursAgo", { count: Math.floor(diffInMinutes / 60) });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 text-center border ${className}`}
      >
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadMembers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center justify-between">
          <span>{t("chat.members")}</span>
          <span className="text-sm text-gray-500 font-normal">
            {members.length} / {room.maxMembers || "∞"}
          </span>
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {members.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-500">{t("chat.noMembers")}</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar with status indicator */}
                <div className="relative flex-shrink-0">
                  {member.user.profilePictureUrl ? (
                    <img
                      src={member.user.profilePictureUrl}
                      alt={member.user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Online status indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 ${getMemberStatusColor(
                      member.isOnline
                    )} rounded-full border-2 border-white`}
                  ></div>
                </div>

                {/* Member info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 truncate">
                      {member.user.displayName}
                    </span>

                    {/* Role icon */}
                    {getMemberRoleIcon(member.role) && (
                      <span className="text-sm" title={member.role}>
                        {getMemberRoleIcon(member.role)}
                      </span>
                    )}

                    {/* You indicator */}
                    {user && member.user.id === user.id && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t("chat.you")}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    {member.isOnline ? (
                      <span className="text-green-600">{t("chat.online")}</span>
                    ) : (
                      <span>
                        {t("chat.lastSeen")} {formatLastSeen(member.lastSeen)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {t("chat.joinedOn")}{" "}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {canRemoveMember(member.user.id) && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={removingMemberId === member.user.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title={t("chat.removeMember")}
                    >
                      {removingMemberId === member.user.id ? "⏳" : "🗑️"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;
