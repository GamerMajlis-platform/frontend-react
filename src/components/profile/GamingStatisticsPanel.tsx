import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "../../types/auth";

interface GameStat {
  game: string;
  hoursPlayed: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  rank?: string;
  achievements: number;
  lastPlayed: string;
}

interface GamingStatistics {
  totalHoursPlayed: number;
  totalGamesPlayed: number;
  overallWinRate: number;
  favoriteGame: string;
  currentStreak: number;
  longestStreak: number;
  totalAchievements: number;
  gameStats: GameStat[];
  lastUpdated: string;
}

export default function GamingStatisticsPanel(props?: { viewUser?: User }) {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const { updateGamingStats, isLoading } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [statistics, setStatistics] = useState<GamingStatistics>({
    totalHoursPlayed: 0,
    totalGamesPlayed: 0,
    overallWinRate: 0,
    favoriteGame: "",
    currentStreak: 0,
    longestStreak: 0,
    totalAchievements: 0,
    gameStats: [],
    lastUpdated: new Date().toISOString(),
  });

  // Initialize from user data or viewUser when provided
  useEffect(() => {
    const source = props?.viewUser ?? user;
    if (source?.parsedGamingStatistics) {
      setStatistics((prev) => ({ ...prev, ...source.parsedGamingStatistics }));
    }
  }, [user, props?.viewUser]);

  const handleSave = async () => {
    try {
      await updateGamingStats({
        ...statistics,
        lastUpdated: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update gaming statistics:", err);
    }
  };

  const handleCancel = () => {
    if (user?.parsedGamingStatistics) {
      setStatistics((prev) => ({ ...prev, ...user.parsedGamingStatistics }));
    }
    setIsEditing(false);
  };

  const calculateOverallStats = () => {
    const totalWins = statistics.gameStats.reduce(
      (sum, game) => sum + game.wins,
      0
    );
    const totalLosses = statistics.gameStats.reduce(
      (sum, game) => sum + game.losses,
      0
    );
    const totalGames = totalWins + totalLosses;
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    return {
      totalWins,
      totalLosses,
      totalGames,
      winRate: Math.round(winRate * 10) / 10,
    };
  };

  const addNewGameStat = () => {
    const newGame: GameStat = {
      game: "",
      hoursPlayed: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      achievements: 0,
      lastPlayed: new Date().toISOString(),
    };
    setStatistics((prev) => ({
      ...prev,
      gameStats: [...prev.gameStats, newGame],
    }));
  };

  const removeGameStat = (index: number) => {
    setStatistics((prev) => ({
      ...prev,
      gameStats: prev.gameStats.filter((_, i) => i !== index),
    }));
  };

  const updateGameStat = (
    index: number,
    field: keyof GameStat,
    value: string | number
  ) => {
    setStatistics((prev) => ({
      ...prev,
      gameStats: prev.gameStats.map((game, i) => {
        if (i === index) {
          const updated = { ...game, [field]: value };
          // Recalculate win rate if wins or losses changed
          if (field === "wins" || field === "losses") {
            const totalGames = updated.wins + updated.losses;
            updated.winRate =
              totalGames > 0
                ? Math.round((updated.wins / totalGames) * 1000) / 10
                : 0;
          }
          return updated;
        }
        return game;
      }),
    }));
  };

  const overallStats = calculateOverallStats();

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "text-primary",
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/20`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const NumberInput = ({
    value,
    onChange,
    min = 0,
    max,
    disabled = false,
    placeholder = "0",
  }: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <input
      type="number"
      value={value || ""}
      onChange={(e) =>
        onChange(
          Math.max(
            min,
            Math.min(max || Infinity, parseInt(e.target.value) || 0)
          )
        )
      }
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          {t("profile:gaming.statistics")}
        </h2>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isLoading ? t("common.saving") : t("common.save")}
              </button>
            </>
          ) : (
            // Hide edit button when viewing another user's stats
            !props?.viewUser && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
              >
                {t("common.edit")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("profile:gaming.stats.totalHours")}
          value={statistics.totalHoursPlayed.toLocaleString()}
          subtitle={t("profile:gaming.stats.hours")}
          icon={
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="text-blue-400"
        />
        <StatCard
          title={t("profile:gaming.stats.totalGames")}
          value={overallStats.totalGames.toLocaleString()}
          subtitle={t("profile:gaming.stats.gamesPlayed")}
          icon={
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          }
          color="text-green-400"
        />
        <StatCard
          title={t("profile:gaming.stats.winRate")}
          value={`${overallStats.winRate}%`}
          subtitle={`${overallStats.totalWins}W - ${overallStats.totalLosses}L`}
          icon={
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          }
          color="text-yellow-400"
        />
        <StatCard
          title={t("profile:gaming.stats.achievements")}
          value={statistics.totalAchievements.toLocaleString()}
          subtitle={t("profile:gaming.stats.unlocked")}
          icon={
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          }
          color="text-purple-400"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("profile:gaming.stats.favoriteGame")}
          </h3>
          {isEditing ? (
            <input
              type="text"
              value={statistics.favoriteGame}
              onChange={(e) =>
                setStatistics((prev) => ({
                  ...prev,
                  favoriteGame: e.target.value,
                }))
              }
              placeholder={t("profile:gaming.stats.favoriteGame.placeholder")}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <p className="text-primary text-xl font-semibold">
              {statistics.favoriteGame || t("profile:gaming.stats.notSet")}
            </p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("profile:gaming.stats.currentStreak")}
          </h3>
          {isEditing ? (
            <NumberInput
              value={statistics.currentStreak}
              onChange={(value) =>
                setStatistics((prev) => ({ ...prev, currentStreak: value }))
              }
              min={0}
            />
          ) : (
            <p className="text-green-400 text-xl font-semibold">
              {statistics.currentStreak} {t("profile:gaming.stats.games")}
            </p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("profile:gaming.stats.longestStreak")}
          </h3>
          {isEditing ? (
            <NumberInput
              value={statistics.longestStreak}
              onChange={(value) =>
                setStatistics((prev) => ({ ...prev, longestStreak: value }))
              }
              min={0}
            />
          ) : (
            <p className="text-orange-400 text-xl font-semibold">
              {statistics.longestStreak} {t("profile:gaming.stats.games")}
            </p>
          )}
        </div>
      </div>

      {/* Individual Game Statistics */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">
            {t("profile:gaming.stats.gameBreakdown")}
          </h3>
          {isEditing && (
            <button
              onClick={addNewGameStat}
              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-colors"
            >
              {t("profile:gaming.stats.addGame")}
            </button>
          )}
        </div>

        {statistics.gameStats.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p>{t("profile:gaming.stats.noGames")}</p>
            {isEditing && (
              <button
                onClick={addNewGameStat}
                className="mt-4 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
              >
                {t("profile:gaming.stats.addFirstGame")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {statistics.gameStats.map((game, index) => (
              <div
                key={index}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={game.game}
                        onChange={(e) =>
                          updateGameStat(index, "game", e.target.value)
                        }
                        placeholder={t("profile:gaming.stats.gameName")}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    ) : (
                      <div>
                        <p className="font-semibold text-white">
                          {game.game || t("profile:gaming.stats.unnamedGame")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {t("profile:gaming.stats.winRate")}: {game.winRate}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t("profile:gaming.stats.hoursPlayed")}
                    </label>
                    {isEditing ? (
                      <NumberInput
                        value={game.hoursPlayed}
                        onChange={(value) =>
                          updateGameStat(index, "hoursPlayed", value)
                        }
                        min={0}
                      />
                    ) : (
                      <p className="text-white">{game.hoursPlayed}h</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t("profile:gaming.stats.wins")}
                    </label>
                    {isEditing ? (
                      <NumberInput
                        value={game.wins}
                        onChange={(value) =>
                          updateGameStat(index, "wins", value)
                        }
                        min={0}
                      />
                    ) : (
                      <p className="text-green-400">{game.wins}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t("profile:gaming.stats.losses")}
                    </label>
                    {isEditing ? (
                      <NumberInput
                        value={game.losses}
                        onChange={(value) =>
                          updateGameStat(index, "losses", value)
                        }
                        min={0}
                      />
                    ) : (
                      <p className="text-red-400">{game.losses}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t("profile:gaming.stats.achievements")}
                    </label>
                    {isEditing ? (
                      <NumberInput
                        value={game.achievements}
                        onChange={(value) =>
                          updateGameStat(index, "achievements", value)
                        }
                        min={0}
                      />
                    ) : (
                      <p className="text-purple-400">{game.achievements}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeGameStat(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        title={t("common.delete")}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {statistics.lastUpdated && (
        <div className="text-center text-sm text-slate-400">
          {t("profile:gaming.stats.lastUpdated")}:{" "}
          {new Date(statistics.lastUpdated).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
