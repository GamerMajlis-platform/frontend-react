import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import { useProfile } from "../../hooks/useProfile";

interface GamingPreferences {
  favoriteGames: string[];
  preferredGenres: string[];
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  playtime: "casual" | "regular" | "hardcore";
  platforms: string[];
}

interface SocialLinks {
  twitch?: string;
  youtube?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  steam?: string;
  epicGames?: string;
  personalWebsite?: string;
}

// Privacy settings are handled in Settings; removed from this form.

export default function EnhancedProfileForm() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const { updateProfile, isLoading, error } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState<{
    basic: boolean;
    gaming: boolean;
    social: boolean;
  }>({ basic: false, gaming: false, social: false });

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [gamingPreferences, setGamingPreferences] = useState<GamingPreferences>(
    {
      favoriteGames: [],
      preferredGenres: [],
      skillLevel: "beginner",
      playtime: "casual",
      platforms: [],
    }
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  // privacy managed in Settings

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");

      // Parse JSON fields
      try {
        if (user.parsedGamingPreferences) {
          setGamingPreferences((prev) => ({
            ...prev,
            ...user.parsedGamingPreferences,
          }));
        }
        if (user.parsedSocialLinks) {
          setSocialLinks(user.parsedSocialLinks as SocialLinks);
        }
        // privacy handled in Settings
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName,
        bio,
        gamingPreferences: JSON.stringify(gamingPreferences),
        socialLinks: JSON.stringify(socialLinks),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      try {
        if (user.parsedGamingPreferences) {
          setGamingPreferences((prev) => ({
            ...prev,
            ...user.parsedGamingPreferences,
          }));
        }
        if (user.parsedSocialLinks) {
          setSocialLinks(user.parsedSocialLinks as SocialLinks);
        }
        // privacy handled in Settings
      } catch (error) {
        console.error("Error resetting form:", error);
      }
    }
    setIsEditing(false);
  };

  const Section = ({
    children,
    title,
    isOpen,
    onToggle,
  }: {
    children: React.ReactNode;
    title: string;
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between p-4 text-left font-semibold transition-colors ${
          isOpen
            ? "bg-primary/20 text-primary border-b border-primary/30"
            : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
        }`}
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 text-slate-300 transform transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && <div className="p-6 bg-slate-800/30">{children}</div>}
    </div>
  );

  const InputField = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    maxLength,
    disabled = false,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "textarea" | "url";
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      )}
      {maxLength && (
        <div className="text-xs text-slate-400 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );

  const SelectField = ({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // ToggleField removed; privacy toggles are handled in Settings

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t("profile:manage")}</h2>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? t("common.saving") : t("common.save")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors"
            >
              {t("common.edit")}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Profile Sections */}
      <div className="space-y-4">
        {/* Basic Information */}
        <Section
          title={t("profile:sections.basic")}
          isOpen={sectionsOpen.basic}
          onToggle={() =>
            setSectionsOpen((prev) => ({ ...prev, basic: !prev.basic }))
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label={t("profile:displayName")}
              value={displayName}
              onChange={setDisplayName}
              placeholder={t("profile:displayName.placeholder")}
              disabled={!isEditing}
              required
              maxLength={50}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("profile:discordUsername")}
              </label>
              <input
                type="text"
                value={user?.discordUsername || "Not linked"}
                disabled
                className="w-full px-3 py-2 bg-slate-600/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">
                {t("profile:discord.managedByOAuth")}
              </p>
            </div>
            <div className="md:col-span-2">
              <InputField
                label={t("profile:bio")}
                value={bio}
                onChange={setBio}
                type="textarea"
                placeholder={t("profile:placeholders.bio")}
                disabled={!isEditing}
                maxLength={500}
              />
            </div>
          </div>
        </Section>

        {/* Gaming Preferences */}
        <Section
          title={t("profile:sections.gaming")}
          isOpen={sectionsOpen.gaming}
          onToggle={() =>
            setSectionsOpen((prev) => ({ ...prev, gaming: !prev.gaming }))
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            <SelectField
              label={t("profile:gaming.skillLevel")}
              value={gamingPreferences.skillLevel}
              onChange={(value) =>
                setGamingPreferences((prev) => ({
                  ...prev,
                  skillLevel: value as GamingPreferences["skillLevel"],
                }))
              }
              options={[
                {
                  value: "beginner",
                  label: t("profile:gaming.skillLevel.beginner"),
                },
                {
                  value: "intermediate",
                  label: t("profile:gaming.skillLevel.intermediate"),
                },
                {
                  value: "advanced",
                  label: t("profile:gaming.skillLevel.advanced"),
                },
                {
                  value: "professional",
                  label: t("profile:gaming.skillLevel.professional"),
                },
              ]}
              disabled={!isEditing}
            />
            <SelectField
              label={t("profile:gaming.playtime")}
              value={gamingPreferences.playtime}
              onChange={(value) =>
                setGamingPreferences((prev) => ({
                  ...prev,
                  playtime: value as GamingPreferences["playtime"],
                }))
              }
              options={[
                { value: "casual", label: t("profile:gaming.playtime.casual") },
                {
                  value: "regular",
                  label: t("profile:gaming.playtime.regular"),
                },
                {
                  value: "hardcore",
                  label: t("profile:gaming.playtime.hardcore"),
                },
              ]}
              disabled={!isEditing}
            />
            <div className="md:col-span-2 space-y-4">
              <InputField
                label={t("profile:gaming.favoriteGames")}
                value={gamingPreferences.favoriteGames.join(", ")}
                onChange={(value) =>
                  setGamingPreferences((prev) => ({
                    ...prev,
                    favoriteGames: value
                      .split(",")
                      .map((g) => g.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder={t("profile:gaming.favoriteGames.placeholder")}
                disabled={!isEditing}
              />
              <InputField
                label={t("profile:gaming.platforms")}
                value={gamingPreferences.platforms.join(", ")}
                onChange={(value) =>
                  setGamingPreferences((prev) => ({
                    ...prev,
                    platforms: value
                      .split(",")
                      .map((p) => p.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder={t("profile:gaming.platforms.placeholder")}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Section>

        {/* Social Links */}
        <Section
          title={t("profile:sections.social")}
          isOpen={sectionsOpen.social}
          onToggle={() =>
            setSectionsOpen((prev) => ({ ...prev, social: !prev.social }))
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries({
              twitter: "Twitter/X",
              instagram: "Instagram",
              steam: "Steam",
            }).map(([key, label]) => (
              <InputField
                key={key}
                label={label}
                value={socialLinks[key as keyof SocialLinks] || ""}
                onChange={(value) =>
                  setSocialLinks((prev) => ({
                    ...prev,
                    [key]: value || undefined,
                  }))
                }
                type="url"
                placeholder={`https://...`}
                disabled={!isEditing}
              />
            ))}
          </div>
        </Section>

        {/* Privacy settings removed from this form (managed in Settings) */}
      </div>
    </div>
  );
}
