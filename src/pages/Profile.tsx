import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/useAppContext";
import { useProfile } from "../hooks/useProfile";
import PreferencesList from "../components/profile/PreferencesList";
import StatsList from "../components/profile/StatsList";
import TabBar from "../components/profile/TabBar";
import AboutSection from "../components/profile/AboutSection";
import BackendProfileHeader from "../components/profile/BackendProfileHeader";
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
  const { user } = useAppContext();
  const { updateProfile, clearError } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
  });

  const isRTL = i18n.language === "ar";

  // Initialize edit data when user data is available
  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Legacy profile data for preferences and stats (TODO: integrate with backend)
  const [profileData, setProfileData] = useState<ProfileData>(
    getInitialProfileData
  );

  const startEditing = useCallback(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(true);
    clearError();
  }, [user, clearError]);

  const cancelEditing = useCallback(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(false);
    clearError();
  }, [user, clearError]);

  const saveEditing = useCallback(async () => {
    try {
      await updateProfile({
        displayName: editData.displayName,
        bio: editData.bio,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Error will be shown by the useProfile hook
    }
  }, [updateProfile, editData]);

  const handleInputChange = useCallback(
    (field: "displayName" | "bio", value: string) => {
      setEditData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Preferences handlers
  const addPreference = useCallback(() => {
    setProfileData((p) => ({
      ...p,
      preferences: [...p.preferences, { id: generateId(), text: "" }],
    }));
  }, []);
  const removePreference = useCallback((id: string) => {
    setProfileData((p) => ({
      ...p,
      preferences: p.preferences.filter((i) => i.id !== id),
    }));
  }, []);
  const updatePreference = useCallback((id: string, text: string) => {
    setProfileData((p) => ({
      ...p,
      preferences: p.preferences.map((i) => (i.id === id ? { ...i, text } : i)),
    }));
  }, []);

  // Stats handlers
  const addStat = useCallback(() => {
    setProfileData((p) => ({
      ...p,
      stats: [
        ...p.stats,
        { id: generateId(), name: "", value: 50, color: statColorOptions[6] },
      ],
    }));
  }, []);
  const removeStat = useCallback((id: string) => {
    setProfileData((p) => ({
      ...p,
      stats: p.stats.filter((s) => s.id !== id),
    }));
  }, []);
  const updateStat = useCallback((id: string, patch: Partial<StatItem>) => {
    setProfileData((p) => ({
      ...p,
      stats: p.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  // Avatar handled inside BackendProfileHeader component

  // Name, level and bio are handled in subcomponents

  // Tabs are rendered via TabBar component

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 ${
        isRTL ? "font-[Tahoma,Arial,sans-serif]" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-slate-700/50 shadow-2xl mb-8 bg-slate-800/90">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-300/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />

          <div className="relative p-4 sm:p-6 lg:p-12">
            <BackendProfileHeader
              isEditing={isEditing}
              isRTL={isRTL}
              onChange={(field, value) => handleInputChange(field, value)}
              onSave={saveEditing}
              onCancel={cancelEditing}
              onEdit={startEditing}
            />
          </div>
        </div>

        {/* Tabs */}
        <TabBar active={activeTab} onChange={(key) => setActiveTab(key)} />

        {/* Content Panels */}
        <div className="overflow-hidden bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-xl">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "about" && (
              <AboutSection
                isEditing={isEditing}
                isRTL={isRTL}
                bio={profileData.bio}
                onChange={(val) => handleInputChange("bio", val)}
              />
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.preferences")}
                </h2>
                <PreferencesList
                  items={profileData.preferences}
                  isEditing={isEditing}
                  isRTL={isRTL}
                  onAdd={addPreference}
                  onRemove={removePreference}
                  onUpdate={updatePreference}
                />
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.stats")}
                </h2>
                <StatsList
                  items={profileData.stats}
                  isEditing={isEditing}
                  isRTL={isRTL}
                  onAdd={addStat}
                  onRemove={removeStat}
                  onUpdate={updateStat}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
