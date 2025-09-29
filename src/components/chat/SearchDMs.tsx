import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ProfileService } from "../../services/ProfileService";
import { chatService } from "../../services/ChatService";
import { useDebounce } from "../../hooks/useDebounce";
import type { ProfileSearchResult } from "../../services/ProfileService";

interface Props {
  onStartDirectMessage?: (recipientId: number) => Promise<void> | void;
  className?: string;
}

const SearchDMs: React.FC<Props> = ({
  onStartDirectMessage,
  className = "",
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const resp = await ProfileService.searchProfiles({
          query: q,
          page: 0,
          size: 10,
        });
        setResults(resp.profiles || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : t("chat:errors.searchFailed")
        );
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  React.useEffect(() => {
    search(debounced);
  }, [debounced, search]);

  const handleStart = async (userId: number) => {
    // Prefer using parent-provided handler so Chat page can manage selection/join
    if (onStartDirectMessage) {
      try {
        setLoading(true);
        await onStartDirectMessage(userId);
        return;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : t("chat:errors.startDmFailed")
        );
      } finally {
        setLoading(false);
      }
    }

    // Fallback: call API directly if parent handler not provided
    try {
      setLoading(true);
      const room = await chatService.startDirectMessage({
        recipientId: userId,
      });
      // attempt to join so the DM appears in user's rooms
      try {
        await chatService.joinRoom(room.id);
      } catch (e) {
        // ignore join errors for fallback
        console.debug("joinRoom fallback failed", e);
      }
      // parent didn't provide handler, just set results/notify user
    } catch (e) {
      console.error("Failed to start DM:", e);
      setError(e instanceof Error ? e.message : t("chat:errors.startDmFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`px-3 py-2 ${className}`}>
      <div className="relative mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("chat:searchUsers")}
          className="w-full px-3 py-2 pl-8 border border-slate-600 rounded bg-transparent text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute left-2 top-2 text-gray-400">🔍</div>
      </div>

      {error && <div className="text-xxs text-red-400">{error}</div>}

      {loading && (
        <div className="text-xxs text-gray-400">
          {t("chat:searching", "Searching...")}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-1">
          {results.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded hover:bg-slate-800"
            >
              <div className="min-w-0 pr-2">
                <div className="text-sm text-white truncate">
                  {p.displayName}
                </div>
                {p.bio && (
                  <div className="text-xxs text-gray-400 truncate">{p.bio}</div>
                )}
              </div>
              <div>
                <button
                  onClick={() => handleStart(p.id)}
                  className="text-xs px-2 py-0.5 bg-primary text-black rounded hover:bg-primary-dark"
                >
                  {t("chat:message", "Message")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDMs;
