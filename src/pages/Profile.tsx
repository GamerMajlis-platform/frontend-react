import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/useAppContext";
import { useProfile } from "../hooks/useProfile";
import TabBar from "../components/profile/TabBar";
import AboutSection from "../components/profile/AboutSection";
import BackendProfileHeader from "../components/profile/BackendProfileHeader";
import EnhancedProfileForm from "../components/profile/EnhancedProfileForm";
import GamingStatisticsPanel from "../components/profile/GamingStatisticsPanel";
import OnlineStatus from "../components/profile/OnlineStatus";
import { useParams } from "react-router-dom";
import type { User } from "../types/auth";
import { Youtube, Twitter, Instagram, Twitch, GamepadIcon } from "../lib/icons";
import AvatarImage from "../components/profile/AvatarImage";

type TabKey = "about" | "manage" | "stats";

export default function Profile() {
  const { i18n } = useTranslation();
  const { user, settings } = useAppContext();
  const { updateProfile, isLoading } = useProfile();
  const { getUserProfile } = useProfile();
  const { id: routeId } = useParams();
  // Editing is managed per-section (About, Manage, Stats)
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [editData, setEditData] = useState({
    displayName: "",
    bio: "",
    gamingPreferences: "",
    socialLinks: "",
  });
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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

  // Load profile when route id changes (or show current user when no id)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // clear error state when loading
      setIsLoadingProfile(true);
      try {
        if (routeId) {
          const uid = Number(routeId);
          if (!Number.isFinite(uid) || uid <= 0) {
            throw new Error("Invalid user id");
          }
          // If viewing own profile via id, prefer context user
          if (user && user.id === uid) {
            setViewedUser(user);
          } else {
            const u = await getUserProfile(uid);
            if (!cancelled) setViewedUser(u);
          }
        } else {
          setViewedUser(user ?? null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        // ignore: UI shows loading state only
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [routeId, user, getUserProfile]);

  // Section-level edit/save/cancel handlers live inside each panel

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

  // Privacy handling for viewed profiles
  const isOwner = Boolean(user && viewedUser && user.id === viewedUser.id);
  const parsedPrivacy =
    (viewedUser?.parsedPrivacySettings as
      | Record<string, unknown>
      | undefined) ?? {};

  const visibility =
    typeof parsedPrivacy["profileVisibility"] === "string"
      ? (parsedPrivacy["profileVisibility"] as "public" | "friends" | "private")
      : "public";

  // Helpers to determine whether specific sections should be visible.
  // Note: 'friends' visibility is treated as restricted for now (requires backend friend-check API).
  const canViewProfile = isOwner || visibility === "public";
  const canViewBio = canViewProfile;
  const canViewStats =
    canViewProfile &&
    (typeof parsedPrivacy["showGamingStats"] === "undefined"
      ? true
      : Boolean(parsedPrivacy["showGamingStats"]));

  // Respect the current viewer's settings: if the viewer disabled
  // showing gaming statistics in their own settings, do not display
  // gaming stats for searched/viewed profiles.
  const viewerAllowsStats =
    settings?.privacy?.showGamingStats === undefined
      ? true
      : Boolean(settings.privacy.showGamingStats);

  const finalCanViewStats = canViewStats && viewerAllowsStats;
  const canViewSocials =
    canViewProfile &&
    (typeof parsedPrivacy["showSocialLinks"] === "undefined"
      ? true
      : Boolean(parsedPrivacy["showSocialLinks"]));

  // Ensure activeTab is always a visible tab. If the current active tab becomes hidden
  // (e.g. About hidden for non-owner, or Stats hidden by privacy), pick a fallback.
  useEffect(() => {
    const available: TabKey[] = [];
    if (viewedUser?.id === user?.id) available.push("about");
    if (viewedUser?.id === user?.id) available.push("manage");
    if (finalCanViewStats) available.push("stats");

    if (!available.includes(activeTab)) {
      // Prefer manage (owner), then stats, then about
      if (available.includes("manage")) setActiveTab("manage");
      else if (available.includes("stats")) setActiveTab("stats");
      else if (available.includes("about")) setActiveTab("about");
      else setActiveTab("manage");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedUser?.id, user?.id, finalCanViewStats]);

  // Determine whether any panel (About / Manage / Stats) should be shown inside the
  // main content area. If none are available, hide the rounded content container
  // entirely to avoid rendering an empty box (this prevents the empty container you
  // saw when viewing other users with restricted stats/privacy).
  const hasPanelContent =
    Boolean(viewedUser && viewedUser.id === user?.id) ||
    Boolean(finalCanViewStats);

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
            {/* If viewing another user's profile, render read-only header with privacy-aware content */}
            {isLoadingProfile ? (
              <div className="h-32 bg-slate-700 rounded animate-pulse" />
            ) : viewedUser && viewedUser.id !== user?.id ? (
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
                <div className="w-24 h-24 bg-slate-700 rounded-full overflow-hidden">
                  {viewedUser.profilePictureUrl ? (
                    <AvatarImage
                      source={viewedUser.profilePictureUrl}
                      alt={viewedUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg
                        className="w-12 h-12"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div
                  className={`space-y-4 order-2 w-full text-center ${
                    isRTL ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white">
                      {viewedUser.displayName}
                    </h1>
                    <OnlineStatus
                      isOnline={Boolean(viewedUser?.isOnline)}
                      lastSeen={
                        viewedUser?.lastLogin ?? viewedUser?.lastSeen ?? null
                      }
                      className="ml-2"
                    />
                  </div>
                  {/* Privacy enforcement using computed flags */}
                  {!canViewProfile ? (
                    <p className="text-slate-400 italic">
                      {i18n.t(
                        viewedUser &&
                          (visibility === "friends"
                            ? "profile:visibility.friends"
                            : "profile:visibility.private"),
                        "This profile is private"
                      )}
                    </p>
                  ) : (
                    <>
                      {canViewBio && viewedUser.bio ? (
                        <p className="text-slate-300 text-sm">
                          {viewedUser.bio}
                        </p>
                      ) : null}

                      {canViewSocials && viewedUser.parsedSocialLinks ? (
                        <div
                          className={`flex items-center gap-3 ${
                            isRTL
                              ? "flex-row-reverse justify-end"
                              : "flex-row justify-start"
                          } mt-2 justify-center`}
                        >
                          {typeof viewedUser.parsedSocialLinks === "object" &&
                            Object.entries(viewedUser.parsedSocialLinks).map(
                              ([k, v]) => {
                                if (!v || typeof v !== "string") return null;
                                const url = v as string;
                                const key = k.toLowerCase();
                                if (key === "youtube")
                                  return (
                                    <a
                                      key={key}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-500 hover:text-red-600 transition-colors"
                                      title="YouTube"
                                    >
                                      <Youtube size={16} />
                                    </a>
                                  );
                                if (key === "twitter")
                                  return (
                                    <a
                                      key={key}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-500 transition-colors"
                                      title="Twitter/X"
                                    >
                                      <Twitter size={16} />
                                    </a>
                                  );
                                if (key === "instagram")
                                  return (
                                    <a
                                      key={key}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-500 hover:text-pink-600 transition-colors"
                                      title="Instagram"
                                    >
                                      <Instagram size={16} />
                                    </a>
                                  );
                                if (key === "twitch")
                                  return (
                                    <a
                                      key={key}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-500 hover:text-purple-600 transition-colors"
                                      title="Twitch"
                                    >
                                      <Twitch size={16} />
                                    </a>
                                  );
                                if (key === "steam")
                                  return (
                                    <a
                                      key={key}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-400 hover:text-slate-300 transition-colors"
                                      title="Steam"
                                    >
                                      <GamepadIcon size={16} />
                                    </a>
                                  );
                                return null;
                              }
                            )}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="order-3 lg:order-3 flex gap-3">
                  {/* Viewing another user's profile; no actions for now */}
                </div>
              </div>
            ) : (
              <BackendProfileHeader
                isRTL={isRTL}
                onChange={(field, value) => handleInputChange(field, value)}
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <TabBar
          active={activeTab}
          onChange={(key) => setActiveTab(key)}
          showManage={viewedUser?.id === user?.id}
          showAbout={viewedUser?.id === user?.id}
          showStats={finalCanViewStats}
        />

        {/* Content Panels */}
        {hasPanelContent && (
          <div className="overflow-hidden bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              {activeTab === "about" && viewedUser?.id === user?.id && (
                <AboutSection
                  isRTL={isRTL}
                  bio={editData.bio}
                  isSaving={isLoading}
                  onSave={async (newBio) => {
                    // Use updateProfile to save only bio; keep other fields unchanged
                    try {
                      await updateProfile({
                        displayName: editData.displayName,
                        bio: newBio,
                        gamingPreferences: editData.gamingPreferences,
                        socialLinks: editData.socialLinks,
                      });
                      // reflect saved bio in editData
                      setEditData((prev) => ({ ...prev, bio: newBio }));
                    } catch (err) {
                      console.error(
                        "Failed to save bio from AboutSection:",
                        err
                      );
                    }
                  }}
                  // AboutSection manages cancel locally; do not wire to global cancelEditing
                />
              )}

              {activeTab === "manage" && viewedUser?.id === user?.id && (
                <EnhancedProfileForm />
              )}

              {activeTab === "stats" && (
                <>
                  {viewedUser &&
                  viewedUser.id !== user?.id &&
                  !finalCanViewStats ? (
                    <div className="p-6 text-slate-400 italic">
                      {i18n.t("profile:visibility.hidden_stats_by_user", {
                        username: viewedUser.displayName,
                      })}
                    </div>
                  ) : viewedUser && viewedUser.id !== user?.id ? (
                    <GamingStatisticsPanel viewUser={viewedUser} />
                  ) : (
                    <GamingStatisticsPanel />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
