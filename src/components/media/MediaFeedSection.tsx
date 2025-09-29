import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MediaFeed } from "./MediaFeed";
import { Search } from "../../lib/icons";
import { MediaService } from "../../services/MediaService";
import type { MediaFilters, MediaListItem } from "../../types";

export const MediaFeedSection: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MediaListItem[] | null>(null);
  const [trending, setTrending] = useState<MediaListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"for-you" | "trending">("for-you");

  const filters: MediaFilters = useMemo(() => ({ page: 0, size: 20 }), []);

  const doSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    try {
      setSearching(true);
      const res = await MediaService.searchMedia({ query, page: 0, size: 20 });
      if (res.success) setResults(res.media);
    } finally {
      setSearching(false);
    }
  }, [query]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await MediaService.getTrendingMedia({ limit: 50, days: 14 });
      if (mounted && res.success) {
        const scored = res.media
          .map((m) => {
            const views = m.viewCount ?? 0;
            const ageDays = Math.max(
              0.001,
              (Date.now() - new Date(m.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const score = views + 50 / ageDays;
            return { item: m, score };
          })
          .sort((a, b) => b.score - a.score)
          .map((s) => s.item);

        setTrending(scored);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center gap-3 w-full">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch();
            }}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#6fffe9]"
            placeholder={t(
              "media:search.placeholder",
              "Search media, tags, games..."
            )}
          />
        </div>
        <button
          onClick={doSearch}
          disabled={searching}
          aria-label={t("common.search")}
          className="w-10 h-10 rounded-lg bg-[#6fffe9] text-black flex items-center justify-center disabled:opacity-50 md:px-4 md:py-2 md:w-auto md:h-auto"
        >
          {searching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
          ) : (
            <Search size={18} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("for-you")}
          className={`px-3 py-1 rounded-md font-medium ${
            activeTab === "for-you"
              ? "bg-[#6fffe9] text-black"
              : "text-white/80"
          }`}
        >
          {t("media:tabs.forYou", "For you")}
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          className={`px-3 py-1 rounded-md font-medium ${
            activeTab === "trending"
              ? "bg-[#6fffe9] text-black"
              : "text-white/80"
          }`}
        >
          {t("media:tabs.trending", "Trending")}
        </button>
      </div>

      {results ? (
        <div>
          <h4 className="text-white/80 text-sm mb-2">
            {t("media:search.results", "Search results")}
          </h4>
          <MediaFeed filters={{ ...filters }} />
        </div>
      ) : activeTab === "trending" ? (
        <div>
          <h4 className="text-white/80 text-sm mb-2">
            {t("media:trending.title", "Trending now")}
          </h4>
          <MediaFeed initialMedia={trending} onMediaSelect={() => {}} />
        </div>
      ) : (
        <MediaFeed filters={{ ...filters }} />
      )}
    </div>
  );
};

export default MediaFeedSection;
