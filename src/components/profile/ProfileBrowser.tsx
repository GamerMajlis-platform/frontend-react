import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ProfileSearch from "./ProfileSearch";
import ProfileCard from "./ProfileCard";
import type {
  ProfileSearchResult,
  ProfileSuggestion,
} from "../../services/ProfileService";

interface ProfileBrowserProps {
  onProfileSelect?: (profile: ProfileSearchResult | ProfileSuggestion) => void;
  className?: string;
}

export default function ProfileBrowser({
  onProfileSelect,
  className = "",
}: ProfileBrowserProps) {
  const { t } = useTranslation();
  const [selectedProfile, setSelectedProfile] = useState<
    ProfileSearchResult | ProfileSuggestion | null
  >(null);

  const handleProfileSelect = useCallback(
    (profile: ProfileSearchResult | ProfileSuggestion) => {
      setSelectedProfile(profile);
      onProfileSelect?.(profile);
    },
    [onProfileSelect]
  );

  const clearSelection = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t("profile:browser.title") || "Discover Gamers"}
        </h2>
        <p className="text-slate-400">
          {t("profile:browser.subtitle") ||
            "Find and connect with fellow gamers"}
        </p>
      </div>

      {/* Search Component */}
      <div className="max-w-2xl mx-auto">
        <ProfileSearch
          onProfileSelect={handleProfileSelect}
          className="w-full"
        />
      </div>

      {/* Selected Profile Display */}
      {selectedProfile && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Selected Profile
            </h3>
            <button
              onClick={clearSelection}
              title="Clear selection"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ProfileCard
            profile={selectedProfile}
            onClick={() => {
              // Handle profile view/interaction
              console.log("View profile:", selectedProfile);
            }}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors font-medium">
              View Full Profile
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
