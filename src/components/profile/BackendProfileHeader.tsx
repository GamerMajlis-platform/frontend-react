import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import { useProfile } from "../../hooks/useProfile";

interface BackendProfileHeaderProps {
  isEditing: boolean;
  isRTL: boolean;
  onChange: (field: "displayName" | "bio", value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function BackendProfileHeader(props: BackendProfileHeaderProps) {
  const { user } = useAppContext();
  const {
    uploadProfilePicture,
    removeProfilePicture,
    isLoading,
    error,
    clearError,
  } = useProfile();
  const { t } = useTranslation();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to backend - let useProfile hook handle errors
    setUploading(true);
    clearError();

    try {
      await uploadProfilePicture(file);
      // Avatar URL will be updated via context refresh
      setAvatarUrl(null); // Clear preview since real image is now loaded
      setUploading(false);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setAvatarUrl(null); // Clear preview on error
      setUploading(false);
      // Error will be handled by useProfile hook and displayed in UI
    }
  };

  const onRemoveAvatar = async () => {
    if (!user?.profilePictureUrl) return;

    setUploading(true);
    clearError();
    try {
      await removeProfilePicture();
      setAvatarUrl(null);
    } catch (err) {
      console.error("Failed to remove avatar:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
        <div className="w-24 h-24 bg-slate-700 rounded-full animate-pulse"></div>
        <div className="space-y-4 order-2 text-center lg:text-left w-full">
          <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const displayName = user.displayName || "User";
  const profileImageUrl = avatarUrl || user.profilePictureUrl || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
      {/* Avatar */}
      <div className="relative order-1">
        <BackendAvatarPicker
          avatarUrl={profileImageUrl}
          onPick={onPickAvatar}
          onRemove={onRemoveAvatar}
          onFileSelected={onAvatarSelected}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          uploading={uploading}
          hasAvatar={!!user.profilePictureUrl}
        />
      </div>

      {/* Name & User Info */}
      <div className="space-y-4 order-2 text-center lg:text-left w-full">
        {props.isEditing ? (
          <>
            <input
              type="text"
              value={displayName}
              onChange={(e) => props.onChange("displayName", e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-xl font-semibold w-full max-w-md"
              placeholder={t("profile.displayName")}
              dir={props.isRTL ? "rtl" : "ltr"}
            />
            <textarea
              value={user.bio || ""}
              onChange={(e) => props.onChange("bio", e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white w-full max-w-md resize-none"
              placeholder={t("profile.bio")}
              rows={3}
              dir={props.isRTL ? "rtl" : "ltr"}
            />
          </>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">
              {displayName}
            </h1>
            {user.bio && <p className="text-slate-300 text-sm">{user.bio}</p>}
          </>
        )}

        {user.discordUsername && (
          <p className="text-slate-400 text-sm">
            Discord: {user.discordUsername}
          </p>
        )}

        {user.emailVerified ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t("profile.emailVerified")}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("profile.emailNotVerified")}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="order-3 lg:order-3 flex gap-3">
        {props.isEditing ? (
          <>
            <button
              onClick={props.onSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? t("common.saving") : t("common.save")}
            </button>
            <button
              onClick={props.onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {t("common.cancel")}
            </button>
          </>
        ) : (
          <button
            onClick={props.onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {t("common.edit")}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="col-span-full bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

interface BackendAvatarPickerProps {
  avatarUrl: string | null;
  onPick: () => void;
  onRemove: () => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploading: boolean;
  hasAvatar: boolean;
}

function BackendAvatarPicker({
  avatarUrl,
  onPick,
  onRemove,
  onFileSelected,
  fileInputRef,
  uploading,
  hasAvatar,
}: BackendAvatarPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="relative group">
      {/* Avatar Image */}
      <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden border-4 border-slate-600 relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Upload Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-2 -right-2 flex gap-1">
        <button
          onClick={onPick}
          disabled={uploading}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-colors"
          title={
            hasAvatar ? t("profile.changeAvatar") : t("profile.uploadAvatar")
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {hasAvatar && (
          <button
            onClick={onRemove}
            disabled={uploading}
            className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-colors"
            title={t("profile.removeAvatar")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={onFileSelected}
        className="hidden"
        aria-label="Upload profile picture"
      />
    </div>
  );
}
