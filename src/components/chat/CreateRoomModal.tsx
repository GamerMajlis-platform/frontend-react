import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { chatService } from "../../services/ChatService";
import type { CreateChatRoomData, ChatRoom } from "../../types/chat";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (room: ChatRoom) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateChatRoomData>({
    name: "",
    description: "",
    type: "GROUP",
    isPrivate: false,
    maxMembers: 50,
    gameTitle: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t("chat.errors.nameRequired"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const room = await chatService.createRoom(formData);
      onRoomCreated(room);
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "GROUP",
        isPrivate: false,
        maxMembers: 50,
        gameTitle: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("chat.errors.createRoomFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateChatRoomData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("chat.createRoom")}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("chat.roomName")} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("chat.enterRoomName")}
                maxLength={100}
                disabled={loading}
              />
            </div>

            {/* Room Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("chat.description")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("chat.enterDescription")}
                rows={3}
                maxLength={500}
                disabled={loading}
              />
            </div>

            {/* Room Type */}
            <div>
              <label
                htmlFor="roomType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("chat.roomType")}
              </label>
              <select
                id="roomType"
                value={formData.type}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "GROUP" | "DIRECT_MESSAGE"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="GROUP">{t("chat.groupRoom")}</option>
                <option value="DIRECT_MESSAGE">
                  {t("chat.directMessage")}
                </option>
              </select>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  handleInputChange("isPrivate", e.target.checked)
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                {t("chat.makePrivate")}
              </label>
            </div>

            {/* Max Members */}
            <div>
              <label
                htmlFor="maxMembers"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("chat.maxMembers")}
              </label>
              <input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) =>
                  handleInputChange("maxMembers", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min={2}
                max={500}
                disabled={loading}
                placeholder={t("chat.enterMaxMembers")}
              />
            </div>

            {/* Game Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("chat.gameTitle")}
              </label>
              <input
                type="text"
                value={formData.gameTitle}
                onChange={(e) => handleInputChange("gameTitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("chat.enterGameTitle")}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? t("common.creating") : t("chat.createRoom")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
