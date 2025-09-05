import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor, TournamentCard } from "../components";
import {
  tournaments,
  tournamentSortOptions,
  type TournamentSortOption,
} from "../data";

export default function Tournaments() {
  const { t } = useTranslation();

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
            Upcoming
          </button>
          <button
            className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
              category === "ongoing"
                ? "bg-[#6FFFE9] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setCategory("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
              category === "past"
                ? "bg-[#6FFFE9] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setCategory("past")}
          >
            Past
          </button>
        </div>

        {/* Search and Sort controls */}
        <section className="mb-6 sm:mb-8 w-full search-section">
          <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row search-controls">
            <input
              type="text"
              placeholder="Search tournaments, organizers..."
              className="h-[40px] sm:h-[45px] lg:h-[50px] w-full max-w-[500px] lg:max-w-[600px] rounded-[8px] sm:rounded-[10px] border border-solid border-slate-600 bg-[#1C2541] px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-slate-400 focus:border-[#6fffe9] focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] focus:outline-none search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />

            <div
              className="relative w-full max-w-[180px] sm:max-w-[200px] sort-container"
              ref={dropdownRef}
            >
              <button
                className="flex h-[40px] sm:h-[45px] lg:h-[50px] w-full items-center justify-between rounded-[8px] sm:rounded-[10px] border-none bg-[#6fffe9] px-3 sm:px-4 py-2 text-sm sm:text-base text-black hover:bg-[#5ee6d3] transition-colors sort-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="truncate">
                  {tournamentSortOptions.find((o) => o.value === sortBy)
                    ?.label || "Sort By"}
                </span>
                <span
                  className={`transform transition-transform duration-300 ease-in-out ml-2 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full z-20 mt-1 w-full rounded-[8px] sm:rounded-[10px] border border-slate-600 bg-[#1C2541] p-2 shadow-lg sort-dropdown">
                  {tournamentSortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`block w-full rounded-[5px] border-none px-3 py-2 text-left text-sm sm:text-base text-white hover:bg-slate-700 transition-colors ${
                        sortBy === option.value
                          ? "bg-slate-700"
                          : "bg-transparent"
                      }`}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cards grid (filtered + sorted + searched) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center gap-4 sm:gap-6 pb-6 pt-2 max-w-full">
          {tournaments
            .filter((t) => t.category === category)
            .filter((t) =>
              [t.game, t.organizer]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
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
                  return a.game.localeCompare(b.game);
                default:
                  return 0;
              }
            })
            .map((t) => (
              <TournamentCard
                key={t.id}
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
