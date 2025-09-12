import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "../components/ProgressBar";
import { getRTLStyles } from "../styles/BaseStyles";
import {
  type StatItem,
  type ProfileData,
  getInitialProfileData,
  generateId,
  statColorOptions,
} from "../data/profile";

type TabKey = "about" | "preferences" | "stats";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);

  const isRTL = i18n.language === "ar";
  const rtlStyles = getRTLStyles(i18n.language === "ar" ? "Arabic" : "English");

  const [profileData, setProfileData] = useState<ProfileData>(
    getInitialProfileData
  );

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => setIsEditing(false);
  const saveEditing = () => setIsEditing(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // Preferences handlers
  const addPreference = () =>
    setProfileData((p) => ({
      ...p,
      preferences: [...p.preferences, { id: generateId(), text: "" }],
    }));
  const removePreference = (id: string) =>
    setProfileData((p) => ({
      ...p,
      preferences: p.preferences.filter((i) => i.id !== id),
    }));
  const updatePreference = (id: string, text: string) =>
    setProfileData((p) => ({
      ...p,
      preferences: p.preferences.map((i) => (i.id === id ? { ...i, text } : i)),
    }));

  // Stats handlers
  const addStat = () =>
    setProfileData((p) => ({
      ...p,
      stats: [
        ...p.stats,
        {
          id: generateId(),
          name: "",
          value: 50,
          color: statColorOptions[6], // Use a different color from the default ones
        },
      ],
    }));
  const removeStat = (id: string) =>
    setProfileData((p) => ({
      ...p,
      stats: p.stats.filter((s) => s.id !== id),
    }));
  const updateStat = (id: string, patch: Partial<StatItem>) =>
    setProfileData((p) => ({
      ...p,
      stats: p.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const autoSizeBio = () => {
    const el = bioRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    autoSizeBio();
  }, [isEditing]);

  const wrapSelection = (before: string, after: string = before) => {
    const el = bioRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value;
    const selected = value.slice(start, end);
    const newValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    handleInputChange("bio", newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
      autoSizeBio();
    });
  };

  const xpPercentage = (profileData.xp / profileData.nextLevelXp) * 100;
  const getDisplayName = () =>
    profileData.displayName || "Enter your display name";
  const getDiscordName = () =>
    profileData.discordName || "Connect your Discord";
  const getBio = () => profileData.bio || "Tell others about yourself...";

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`relative px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
          isActive
            ? "bg-gradient-to-r from-primary to-cyan-300 text-slate-900 shadow-glow"
            : "bg-slate-700/50 text-slate-300 hover:text-white backdrop-blur-sm"
        }`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-300 rounded-full animate-pulse opacity-20" />
        )}
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4"
      style={rtlStyles}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-slate-700/50 shadow-2xl mb-8 bg-slate-800/90">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-300/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />

          <div className="relative p-4 sm:p-6 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
              {/* Avatar Section */}
              <div className="relative group order-1">
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
                        onClick={onPickAvatar}
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
                    onChange={onAvatarSelected}
                    aria-label={t("profile.uploadPhoto")}
                  />
                </div>
              </div>

              {/* Name & Level */}
              <div className="space-y-4 order-2 text-center lg:text-left w-full">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      placeholder={
                        t("profile.placeholders.displayName") ||
                        "Enter your display name"
                      }
                      className="w-full bg-transparent border-b-2 border-primary/50 focus:border-primary text-2xl sm:text-3xl lg:text-4xl font-bold text-white placeholder-slate-400 focus:outline-none transition-colors duration-300"
                      style={isRTL ? { textAlign: "right" } : {}}
                    />
                    <input
                      type="text"
                      value={profileData.discordName}
                      onChange={(e) =>
                        handleInputChange("discordName", e.target.value)
                      }
                      placeholder={
                        t("profile.placeholders.discordName") ||
                        "Discord username"
                      }
                      className="w-full bg-transparent border-b border-slate-500 focus:border-primary text-base sm:text-lg text-slate-300 placeholder-slate-500 focus:outline-none transition-colors duration-300"
                      style={isRTL ? { textAlign: "right" } : {}}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h1
                      className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent ${
                        !profileData.displayName ? "text-slate-500" : ""
                      }`}
                    >
                      {getDisplayName()}
                    </h1>
                    <p
                      className={`text-base sm:text-lg ${
                        profileData.discordName
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {getDiscordName()}
                    </p>
                  </div>
                )}

                {/* Level & XP */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                    <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg text-sm sm:text-base bg-gradient-to-r from-primary to-cyan-300 text-slate-900">
                      {t("profile.level", { level: profileData.level })}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">
                      {profileData.xp.toLocaleString()} /{" "}
                      {profileData.nextLevelXp.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="w-full max-w-md h-2 bg-slate-700 rounded-full overflow-hidden mx-auto lg:mx-0">
                    <ProgressBar percentage={xpPercentage} className="h-full" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 order-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEditing}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
                    >
                      {t("profile.save")}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    >
                      {t("profile.cancel")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base bg-gradient-to-r from-primary to-cyan-300 text-slate-900"
                  >
                    {t("profile.edit")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
          <TabButton id="about" label={t("profile.tabs.about")} />
          <TabButton id="preferences" label={t("profile.tabs.preferences")} />
          <TabButton id="stats" label={t("profile.tabs.stats")} />
        </div>

        {/* Content Panels */}
        <div className="overflow-hidden bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-xl">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "about" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.about")}
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => wrapSelection("**")}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-sm transition-colors"
                      >
                        B
                      </button>
                      <button
                        onClick={() => wrapSelection("*")}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white italic text-sm transition-colors"
                      >
                        I
                      </button>
                    </div>
                    <textarea
                      ref={bioRef}
                      value={profileData.bio}
                      onChange={(e) => {
                        handleInputChange("bio", e.target.value);
                        autoSizeBio();
                      }}
                      placeholder={
                        t("profile.placeholders.bio") ||
                        "Tell others about yourself..."
                      }
                      className="w-full min-h-[120px] bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all duration-300"
                      style={isRTL ? { textAlign: "right" } : {}}
                    />
                    <div className="text-right text-slate-400 text-sm">
                      {profileData.bio.length} / 500
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-base sm:text-lg leading-relaxed ${
                      profileData.bio
                        ? "text-slate-200"
                        : "text-slate-500 italic"
                    } whitespace-pre-wrap`}
                  >
                    {getBio()}
                  </div>
                )}
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.preferences")}
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    {profileData.preferences.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <input
                          value={item.text}
                          onChange={(e) =>
                            updatePreference(item.id, e.target.value)
                          }
                          placeholder={
                            t("profile.placeholders.preferenceItem") ||
                            "Add a preference..."
                          }
                          className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                          style={isRTL ? { textAlign: "right" } : {}}
                        />
                        <button
                          onClick={() => removePreference(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          aria-label="Remove preference"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addPreference}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 bg-gradient-to-r from-primary to-cyan-300 text-slate-900"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("profile.editing.addPreference")}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profileData.preferences.filter((p) => p.text.trim())
                      .length > 0 ? (
                      profileData.preferences
                        .filter((p) => p.text.trim())
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 text-slate-200"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm sm:text-base">
                              {p.text}
                            </span>
                          </div>
                        ))
                    ) : (
                      <div className="text-slate-500 italic text-sm sm:text-base">
                        {t("profile.placeholders.preferenceItem")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.stats")}
                </h2>
                {isEditing ? (
                  <div className="space-y-6">
                    {profileData.stats.map((s) => (
                      <div
                        key={s.id}
                        className="space-y-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            value={s.name}
                            onChange={(e) =>
                              updateStat(s.id, { name: e.target.value })
                            }
                            placeholder={
                              t("profile.placeholders.statName") ||
                              "Stat name (e.g. Win Rate)"
                            }
                            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                            style={isRTL ? { textAlign: "right" } : {}}
                          />
                          <button
                            onClick={() => removeStat(s.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            aria-label="Remove statistic"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={s.value}
                            onChange={(e) =>
                              updateStat(s.id, {
                                value: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-primary"
                            aria-label={
                              s.name || t("profile.placeholders.statName")
                            }
                          />
                          <div className="w-12 sm:w-16 text-right text-white font-bold bg-slate-700 px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-sm sm:text-base">
                            {s.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addStat}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 bg-gradient-to-r from-primary to-cyan-300 text-slate-900"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("profile.editing.addStat")}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profileData.stats.length > 0 ? (
                      profileData.stats.map((s) => (
                        <div
                          key={s.id}
                          className="space-y-2 p-4 bg-slate-700/30 rounded-xl"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium text-sm sm:text-base">
                              {s.name}
                            </span>
                            <span className="text-primary font-bold text-sm sm:text-base">
                              {s.value}%
                            </span>
                          </div>
                          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <ProgressBar
                              percentage={s.value}
                              className="h-full"
                              gradientFrom={s.color.split(" ")[0]}
                              gradientTo={s.color.split(" ")[1]}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-sm sm:text-base">
                        {t("profile.placeholders.statName")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
