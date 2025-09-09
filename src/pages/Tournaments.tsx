import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor, Card } from "../components";
import {
  tournaments,
  tournamentSortOptions,
  type TournamentSortOption,
} from "../data";

export default function Tournaments() {
  const { t, i18n } = useTranslation();
  const [nsReady, setNsReady] = useState(false);

  // Ensure translation namespace is loaded before rendering so UI shows
  // translated strings immediately without requiring a manual reload.
  useEffect(() => {
    const ns = Array.isArray(i18n.options.defaultNS)
      ? i18n.options.defaultNS[0]
      : (i18n.options.defaultNS as string) || "translation";
    i18n.loadNamespaces(ns).then(() => setNsReady(true)).catch(() => setNsReady(true));
  }, [i18n]);

  const isRTL = i18n.language && i18n.language.startsWith("ar");

  // Search / Sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<TournamentSortOption>("date-soonest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Category filter state
  type Category = "upcoming" | "ongoing" | "past";
  const [category, setCategory] = useState<Category>("upcoming");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  if (!nsReady) return null; // minimal guard while translations load

  return (
    <main className="relative z-10 min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1C2541] py-4 sm:py-6 lg:py-8 tournaments-container">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 max-width-container">
        {/* Page Label */}
        <header className="mb-6 sm:mb-8 flex w-full items-center justify-center py-4 sm:py-6 tournaments-header">
          <h1 className="font-alice text-[32px] sm:text-[40px] lg:text-[56px] leading-tight text-white tournaments-title text-center">
            {t("nav.tournaments")}
          </h1>
        </header>

        {/* Category Filter (between label and search) */}
        <div
          className="mb-6 sm:mb-7 flex w-full flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-[100px]"
          aria-label="Tournament category filter"
        >
          <button
            className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
              category === "upcoming"
                ? "bg-[#6FFFE9] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setCategory("upcoming")}
          >
            {t("tournaments.categories.upcoming")}
          </button>
          <button
            className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
              category === "ongoing"
                ? "bg-[#6FFFE9] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setCategory("ongoing")}
          >
            {t("tournaments.categories.ongoing")}
          </button>
          <button
            className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
              category === "past"
                ? "bg-[#6FFFE9] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setCategory("past")}
          >
            {t("tournaments.categories.past")}
          </button>
        </div>

        {/* Search and Sort controls (marketplace-style) */}
        <section className="mb-12 search-section md:mb-8 relative z-10">
          <div className="mb-6 flex w-full max-w-[800px] mx-auto items-center gap-3 search-controls">
            <input
              type="text"
              placeholder={t("tournaments.searchPlaceholder")}
              className={`
                h-12 w-full flex-1 rounded-xl border border-slate-600
                bg-[#1C2541] px-4 py-3 text-white placeholder-slate-400
                transition-all duration-300 focus:border-cyan-300
                focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] focus:outline-none search-input
              `}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />

            <div
              className="relative w-[140px] sort-container"
              ref={dropdownRef}
            >
              <button
                className={`
                  flex h-12 w-full items-center justify-between
                  rounded-xl border-none bg-cyan-300 px-3 py-3 text-slate-900
                  transition-colors duration-200 hover:bg-cyan-200 sort-button
                  text-sm font-medium
                `}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="truncate">{t("tournaments.sort.placeholder")}</span>
                <span
                  className={`ml-1 transform transition-transform duration-300 ease-in-out ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  className={`
                    absolute top-full right-0 z-50 mt-2 w-56 rounded-xl
                    border border-slate-600 bg-slate-800 p-2 shadow-2xl sort-dropdown
                    backdrop-blur-sm
                  `}
                >
                  {tournamentSortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={
                        `block w-full rounded-md border-none px-3 py-2
                        text-white transition-colors duration-200 text-sm
                        hover:bg-slate-700 ${
                          sortBy === option.value ? "bg-slate-700" : "bg-transparent"
                        } ${isRTL ? "text-right pr-3" : "text-left pl-3"}`
                      }
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      >
                      {t(`tournaments.sort.options.${option.value}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* duplicate category row removed to avoid repeating the filters (top filter remains) */}
        </section>

        {/* Cards grid (filtered + sorted + searched) */}
        <section
          className={`
            grid grid-cols-1 justify-items-center gap-8 products-grid
            min-[900px]:grid-cols-2
            xl:grid-cols-3
            md:gap-6
            sm:gap-4
            mt-8 md:mt-6 relative z-0
          `}
        >
          {tournaments
            .filter((t) => t.category === category)
            .filter((t) =>
              [t.game, t.organizer]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
              const collator = new Intl.Collator(
                i18n.language === "ar" ? "ar" : "en",
                { sensitivity: "base" }
              );
              const parsePrize = (s: string) =>
                parseFloat(s.replace(/[^\d.]/g, "")) || 0;
              const aDate = new Date(a.startDate).getTime();
              const bDate = new Date(b.startDate).getTime();
              switch (sortBy) {
                case "date-soonest":
                  return aDate - bDate;
                case "date-latest":
                  return bDate - aDate;
                case "prize-high":
                  return parsePrize(b.prizePool) - parsePrize(a.prizePool);
                case "prize-low":
                  return parsePrize(a.prizePool) - parsePrize(b.prizePool);
                case "players-high":
                  return b.playersJoined - a.playersJoined;
                case "players-low":
                  return a.playersJoined - b.playersJoined;
                case "game":
                  return collator.compare(a.game, b.game);
                default:
                  return 0;
              }
            })
            .map((t) => (
              <Card
                key={t.id}
                preset="tournament"
                variant={t.category}
                imageUrl={t.imageUrl}
                game={t.game}
                organizer={t.organizer}
                startDate={new Date(t.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                prizePool={t.prizePool}
                playersJoined={t.playersJoined}
              />
            ))}
        </section>
      </div>
    </main>
  );
}
