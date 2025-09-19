import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "../ProgressBar";

interface ProfileHeaderProps {
  isEditing: boolean;
  isRTL: boolean;
  displayName: string;
  discordName: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  onChange: (field: "displayName" | "discordName", value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function ProfileHeader(props: ProfileHeaderProps) {
  // Design note:
  // ProfileHeader remains intentionally non-memoized because it holds local state (avatar preview)
  // and is a high-level composition with multiple interactive controls.
  // Memoizing at this level could complicate state sync with parent and offers limited benefit
  // relative to memoizing its sibling leaf components (TabBar, PreferencesList, StatsList, AboutSection).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
      {/* Avatar */}
      <div className="relative order-1">
        <InlineAvatarPicker
          avatarUrl={avatarUrl}
          onPick={onPickAvatar}
          onFileSelected={onAvatarSelected}
          fileInputRef={fileInputRef}
        />
      </div>

      {/* Name & Level */}
      <div className="space-y-4 order-2 text-center lg:text-left w-full">
        <InlineNameSection
          isEditing={props.isEditing}
          isRTL={props.isRTL}
          displayName={props.displayName}
          discordName={props.discordName}
          onChange={props.onChange}
        />
        <InlineLevelXp
          level={props.level}
          xp={props.xp}
          nextLevelXp={props.nextLevelXp}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 order-3">
        <InlineActionButtons
          isEditing={props.isEditing}
          onSave={props.onSave}
          onCancel={props.onCancel}
          onEdit={props.onEdit}
        />
      </div>
    </div>
  );
}

// Inlined subcomponents to reduce file count while keeping behavior identical

interface InlineAvatarPickerProps {
  avatarUrl: string | null;
  onPick: () => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function InlineAvatarPicker({
  avatarUrl,
  onPick,
  onFileSelected,
  fileInputRef,
}: InlineAvatarPickerProps) {
  const { t } = useTranslation();
  return (
    <div className="relative group">
      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full p-1 shadow-xl bg-gradient-to-br from-primary/20 to-cyan-300/20">
        <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-600 overflow-hidden flex items-center justify-center relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-slate-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 lg:pb-3">
            <button
              onClick={onPick}
              className="text-white text-xs font-medium bg-slate-900/80 px-2 py-1 lg:px-3 lg:py-1 rounded-full backdrop-blur-sm"
              aria-label={t("profile.uploadPhoto")}
            >
              {t("profile.uploadPhoto")}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelected}
          aria-label={t("profile.uploadPhoto")}
        />
      </div>
    </div>
  );
}

interface InlineNameSectionProps {
  isEditing: boolean;
  isRTL: boolean;
  displayName: string;
  discordName: string;
  onChange: (field: "displayName" | "discordName", value: string) => void;
}

function InlineNameSection({
  isEditing,
  isRTL,
  displayName,
  discordName,
  onChange,
}: InlineNameSectionProps) {
  const { t } = useTranslation();

  const getDisplayName = () =>
    displayName ||
    (t("profile.placeholders.displayName") as string) ||
    "Enter your display name";
  const getDiscordName = () =>
    discordName ||
    (t("profile.placeholders.discordName") as string) ||
    "Discord username";

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder={
              (t("profile.placeholders.displayName") as string) ||
              "Enter your display name"
            }
            className={`w-full bg-transparent border-b-2 border-primary/50 focus:border-primary text-2xl sm:text-3xl lg:text-4xl font-bold text-white placeholder-slate-400 focus:outline-none transition-colors duration-300 ${
              isRTL ? "text-right" : ""
            }`}
          />
          <input
            type="text"
            value={discordName}
            onChange={(e) => onChange("discordName", e.target.value)}
            placeholder={
              (t("profile.placeholders.discordName") as string) ||
              "Discord username"
            }
            className={`w-full bg-transparent border-b border-slate-500 focus:border-primary text-base sm:text-lg text-slate-300 placeholder-slate-500 focus:outline-none transition-colors duration-300 ${
              isRTL ? "text-right" : ""
            }`}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent ${
              !displayName ? "text-slate-500" : ""
            }`}
          >
            {getDisplayName()}
          </h1>
          <p
            className={`text-base sm:text-lg ${
              discordName ? "text-slate-300" : "text-slate-500"
            }`}
          >
            {getDiscordName()}
          </p>
        </div>
      )}
    </div>
  );
}

interface InlineLevelXpProps {
  level: number;
  xp: number;
  nextLevelXp: number;
}

function InlineLevelXp({ level, xp, nextLevelXp }: InlineLevelXpProps) {
  const { t } = useTranslation();
  const percentage = (xp / nextLevelXp) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
        <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg text-sm sm:text-base bg-gradient-to-r from-primary to-cyan-300 text-slate-900">
          {t("profile.level", { level })}
        </div>
        <div className="text-slate-400 text-xs sm:text-sm">
          {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
        </div>
      </div>
      <div className="w-full max-w-md h-2 bg-slate-700 rounded-full overflow-hidden mx-auto lg:mx-0">
        <ProgressBar percentage={percentage} className="h-full" />
      </div>
    </div>
  );
}

interface InlineActionButtonsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

function InlineActionButtons({
  isEditing,
  onSave,
  onCancel,
  onEdit,
}: InlineActionButtonsProps) {
  const { t } = useTranslation();
  if (isEditing) {
    return (
      <>
        <button
          onClick={onSave}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
        >
          {t("profile.save")}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          {t("profile.cancel")}
        </button>
      </>
    );
  }
  return (
    <button
      onClick={onEdit}
      className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base bg-gradient-to-r from-primary to-cyan-300 text-slate-900"
    >
      {t("profile.edit")}
    </button>
  );
}
