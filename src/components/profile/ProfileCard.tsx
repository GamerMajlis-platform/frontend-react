import {
  getAvatarSrc,
  DEFAULT_BLANK_AVATAR,
  markUploadPathFailed,
  getAlternateUploadUrl,
} from "../../lib/urls";
import type {
  ProfileSearchResult,
  ProfileSuggestion,
} from "../../services/ProfileService";

interface ProfileCardProps {
  profile: ProfileSearchResult | ProfileSuggestion;
  onClick?: (profile: ProfileSearchResult | ProfileSuggestion) => void;
  className?: string;
}

export default function ProfileCard({
  profile,
  onClick,
  className = "",
}: ProfileCardProps) {
  const handleClick = () => {
    onClick?.(profile);
  };

  const isSearchResult = "roles" in profile;

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-300/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.profilePictureUrl ? (
            <img
              src={getAvatarSrc(profile.profilePictureUrl)}
              alt={profile.displayName}
              className="w-full h-full object-cover"
              data-original={profile.profilePictureUrl}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                const orig = img.getAttribute("data-original");
                // Try alternate URL pattern with /api prefix once before falling back
                if (orig) {
                  const alt = getAlternateUploadUrl(orig);
                  if (alt && img.src !== alt) {
                    img.src = alt;
                    return;
                  }
                }
                markUploadPathFailed(orig ?? undefined);
                img.src = DEFAULT_BLANK_AVATAR;
              }}
            />
          ) : (
            <span className="text-primary font-bold text-xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">
            {profile.displayName}
          </h3>

          {profile.bio && (
            <p className="text-slate-300 text-sm mb-3 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Roles (only for search results) */}
          {isSearchResult && (profile as ProfileSearchResult).roles && (
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile as ProfileSearchResult).roles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium"
                >
                  {role.replace("_", " ")}
                </span>
              ))}
            </div>
          )}

          {/* Created Date (only for search results) */}
          {isSearchResult && (profile as ProfileSearchResult).createdAt && (
            <p className="text-slate-400 text-xs">
              Joined{" "}
              {new Date(
                (profile as ProfileSearchResult).createdAt
              ).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Interaction Icon */}
        <div className="text-slate-400 hover:text-primary transition-colors">
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
