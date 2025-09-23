import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/useAppContext";
import { useProfile } from "../hooks/useProfile";
import TabBar from "../components/profile/TabBar";
import AboutSection from "../components/profile/AboutSection";
import BackendProfileHeader from "../components/profile/BackendProfileHeader";
import EnhancedProfileForm from "../components/profile/EnhancedProfileForm";
import GamingStatisticsPanel from "../components/profile/GamingStatisticsPanel";

type TabKey = "about" | "manage" | "stats";

export default function Profile() {
  const { i18n } = useTranslation();
  const { user } = useAppContext();
  const { updateProfile, clearError } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    gamingPreferences: "",
    socialLinks: "",
  });

  const isRTL = i18n.language === "ar";

  // Initialize edit data when user data is available
  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        gamingPreferences: user.gamingPreferences || "{}",
        socialLinks: user.socialLinks || "{}",
      });
    }
  }, [user]);

  const startEditing = useCallback(() => {
    if (user) {
      setEditData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        gamingPreferences: user.gamingPreferences || "{}",
        socialLinks: user.socialLinks || "{}",
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
        gamingPreferences: user.gamingPreferences || "{}",
        socialLinks: user.socialLinks || "{}",
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
        gamingPreferences: editData.gamingPreferences,
        socialLinks: editData.socialLinks,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Error will be shown by the useProfile hook
    }
  }, [updateProfile, editData]);

  const handleInputChange = useCallback(
    (field: keyof typeof editData, value: string) => {
      setEditData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Parse JSON fields from backend user data - not needed for new enhanced components
  // const parsedGamingPreferences = user?.parsedGamingPreferences || {};
  // const parsedSocialLinks = user?.parsedSocialLinks || {};
  // const parsedGamingStatistics = user?.parsedGamingStatistics || {};

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
                bio={editData.bio}
                onChange={(val) => handleInputChange("bio", val)}
              />
            )}

            {activeTab === "manage" && <EnhancedProfileForm />}

            {activeTab === "stats" && <GamingStatisticsPanel />}
          </div>
        </div>
      </div>
    </main>
  );
}
