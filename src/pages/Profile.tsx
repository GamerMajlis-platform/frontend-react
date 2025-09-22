import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/useAppContext";
import { useProfile } from "../hooks/useProfile";
import TabBar from "../components/profile/TabBar";
import AboutSection from "../components/profile/AboutSection";
import BackendProfileHeader from "../components/profile/BackendProfileHeader";

type TabKey = "about" | "preferences" | "stats";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const { updateProfile, updateGamingStats, clearError } = useProfile();
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

  const handleStatsUpdate = useCallback(
    async (stats: Record<string, unknown>) => {
      try {
        await updateGamingStats(stats);
      } catch (err) {
        console.error("Failed to update gaming stats:", err);
      }
    },
    [updateGamingStats]
  );

  // Parse JSON fields from backend user data
  const parsedGamingPreferences = user?.parsedGamingPreferences || {};
  const parsedSocialLinks = user?.parsedSocialLinks || {};
  const parsedGamingStatistics = user?.parsedGamingStatistics || {};

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

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.preferences")}
                </h2>
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Gaming Preferences
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editData.gamingPreferences}
                      onChange={(e) =>
                        handleInputChange("gamingPreferences", e.target.value)
                      }
                      className="w-full bg-slate-600/50 text-white rounded-lg p-3 min-h-[100px] border border-slate-500/50 focus:border-primary/50 focus:outline-none"
                      placeholder="Enter gaming preferences as JSON"
                    />
                  ) : (
                    <div className="text-slate-300">
                      {Object.keys(parsedGamingPreferences).length > 0 ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(parsedGamingPreferences, null, 2)}
                        </pre>
                      ) : (
                        <p>No gaming preferences set</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Social Links
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editData.socialLinks}
                      onChange={(e) =>
                        handleInputChange("socialLinks", e.target.value)
                      }
                      className="w-full bg-slate-600/50 text-white rounded-lg p-3 min-h-[100px] border border-slate-500/50 focus:border-primary/50 focus:outline-none"
                      placeholder="Enter social links as JSON"
                    />
                  ) : (
                    <div className="text-slate-300">
                      {Object.keys(parsedSocialLinks).length > 0 ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(parsedSocialLinks, null, 2)}
                        </pre>
                      ) : (
                        <p>No social links set</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("profile.tabs.stats")}
                </h2>
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Gaming Statistics
                  </h3>
                  <div className="text-slate-300">
                    {Object.keys(parsedGamingStatistics).length > 0 ? (
                      <div className="space-y-4">
                        <pre className="text-sm whitespace-pre-wrap bg-slate-600/30 rounded-lg p-4">
                          {JSON.stringify(parsedGamingStatistics, null, 2)}
                        </pre>
                        {isEditing && (
                          <button
                            onClick={() =>
                              handleStatsUpdate({
                                ...parsedGamingStatistics,
                                lastUpdated: new Date().toISOString(),
                              })
                            }
                            className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors"
                          >
                            Update Stats
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p>No gaming statistics recorded</p>
                        {isEditing && (
                          <button
                            onClick={() =>
                              handleStatsUpdate({
                                totalGames: 0,
                                winRate: 0,
                                favoriteGame: "Not set",
                                hoursPlayed: 0,
                              })
                            }
                            className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors"
                          >
                            Initialize Stats
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
