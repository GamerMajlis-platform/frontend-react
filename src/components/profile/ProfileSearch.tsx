import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useProfile } from "../../hooks/useProfile";
import type {
  ProfileSearchResult,
  ProfileSuggestion,
} from "../../services/ProfileService";

interface ProfileSearchProps {
  onProfileSelect?: (profile: ProfileSearchResult | ProfileSuggestion) => void;
  className?: string;
  autoFocus?: boolean;
  compact?: boolean; // compact layout for header
  dir?: "ltr" | "rtl";
}

export default function ProfileSearch({
  onProfileSelect,
  className = "",
  autoFocus = false,
  compact = false,
  dir,
}: ProfileSearchProps) {
  const { t } = useTranslation();
  const { searchProfiles, getProfileSuggestions, isLoading, error } =
    useProfile();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSearch = useCallback(
    async (query: string, page: number = 0) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const response = await searchProfiles({
          query: query.trim(),
          page,
          size: 10,
        });

        setSearchResults(response.profiles);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setShowResults(true);
        setShowSuggestions(false); // Hide suggestions when showing search results
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
        setShowResults(false);
      }
    },
    [searchProfiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Mark as interacted
      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Debounce search
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [handleSearch, hasInteracted]
  );

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestionsData = await getProfileSuggestions(5);
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    }
  }, [getProfileSuggestions]);

  const handleProfileClick = useCallback(
    (profile: ProfileSearchResult | ProfileSuggestion) => {
      onProfileSelect?.(profile);
      setShowResults(false);
      setShowSuggestions(false);
      setSearchQuery("");
    },
    [onProfileSelect]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 0 && newPage < totalPages) {
        handleSearch(searchQuery, newPage);
      }
    },
    [handleSearch, searchQuery, totalPages]
  );

  const handleFocus = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      loadSuggestions();
    }

    if (searchResults.length > 0) {
      setShowResults(true);
    } else if (!searchQuery && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [
    hasInteracted,
    searchResults.length,
    searchQuery,
    suggestions.length,
    loadSuggestions,
  ]);

  const handleBlur = useCallback(() => {
    // Small delay to allow clicks on results
    setTimeout(() => {
      setShowResults(false);
      setShowSuggestions(false);
    }, 150);
  }, []);

  // Determine direction: prefer explicit prop (from parent/header), fallback to document
  const resolvedDir =
    dir ||
    (typeof document !== "undefined"
      ? document.dir || document.documentElement.dir || "ltr"
      : "ltr");
  const isRTL = resolvedDir === "rtl";

  return (
    <div dir={resolvedDir} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t("profile:search.placeholder")}
          autoFocus={autoFocus}
          aria-label={t("profile:search.aria") || "Search profiles"}
          className={`w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:bg-slate-700/80 transition-all ${
            compact
              ? `${isRTL ? "pl-10 pr-3" : "pr-10 pl-3"} h-10 rounded-lg text-sm`
              : `${isRTL ? "pl-10 pr-4 py-3" : "pr-10 pl-4 py-3"} rounded-xl`
          }`}
        />

        <div
          className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${
            isRTL ? "left-3" : "right-3"
          }`}
        >
          {searchQuery && (
            <button
              aria-label="Clear search"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
                setShowSuggestions(false);
              }}
              className="text-slate-300 hover:text-white"
            >
              ✕
            </button>
          )}

          {isLoading ? (
            <div
              className={`${
                compact ? "w-4 h-4" : "w-5 h-5"
              } border-2 border-primary/30 border-t-primary rounded-full animate-spin`}
            />
          ) : (
            <svg
              className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-slate-400`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div
          className={`absolute top-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto ${
            compact
              ? // For compact mode (header), adjust positioning based on direction
                isRTL
                ? "left-0 w-80 max-w-[80vw]" // RTL: extend to the left
                : "right-0 w-80 max-w-[80vw]" // LTR: extend to the right to avoid nav overlap
              : // For full mode, center the dropdown
              isRTL
              ? "right-0 left-auto w-full min-w-[300px] md:min-w-[320px] lg:min-w-[360px]"
              : "left-0 right-auto w-full min-w-[300px] md:min-w-[320px] lg:min-w-[360px]"
          }`}
        >
          <div className="p-2">
            <h3 className="text-sm font-semibold text-slate-300 px-3 py-2">
              Search Results
            </h3>
            {searchResults.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-slate-700/50 transition-colors ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-cyan-300/20 flex items-center justify-center overflow-hidden">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-semibold">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {profile.displayName}
                  </p>
                  {profile.bio && (
                    <p className="text-slate-400 text-sm truncate">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {profile.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-slate-600/30 mt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-1 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions (shown only when user interacts and no search query) */}
      {showSuggestions && !searchQuery && suggestions.length > 0 && (
        <div
          className={`absolute top-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto ${
            compact
              ? // For compact mode (header), adjust positioning based on direction
                isRTL
                ? "left-0 w-80 max-w-[80vw]" // RTL: extend to the left
                : "right-0 w-80 max-w-[80vw]" // LTR: extend to the right to avoid nav overlap
              : // For full mode, center the dropdown
              isRTL
              ? "right-0 left-auto w-full min-w-[300px] md:min-w-[320px] lg:min-w-[360px]"
              : "left-0 right-auto w-full min-w-[300px] md:min-w-[320px] lg:min-w-[360px]"
          }`}
        >
          <div className="p-2">
            <h3 className="text-sm font-semibold text-slate-300 px-3 py-2">
              {t("profile:browser.suggested") || "Suggested Profiles"}
            </h3>
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleProfileClick(suggestion)}
                  className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-slate-700/50 transition-colors ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-cyan-300/20 flex items-center justify-center overflow-hidden">
                    {suggestion.profilePictureUrl ? (
                      <img
                        src={suggestion.profilePictureUrl}
                        alt={suggestion.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold text-sm">
                        {suggestion.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {suggestion.displayName}
                    </p>
                    {suggestion.bio && (
                      <p className="text-slate-400 text-xs truncate">
                        {suggestion.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
