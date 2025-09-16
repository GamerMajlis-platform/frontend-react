import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor, Card, SortBy, IconSearch } from "../components";
import {
  tournaments,
  tournamentSortOptions,
  type TournamentSortOption,
} from "../data";
import useIsMobile from "../hooks/useIsMobile";

export default function Tournaments() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);
  const [nsReady, setNsReady] = useState(false);

  // Ensure translation namespace is loaded before rendering so UI shows
  // translated strings immediately without requiring a manual reload.
  useEffect(() => {
    const ns = Array.isArray(i18n.options.defaultNS)
      ? i18n.options.defaultNS[0]
      : (i18n.options.defaultNS as string) || "translation";
    i18n
      .loadNamespaces(ns)
      .then(() => setNsReady(true))
      .catch(() => setNsReady(true));
  }, [i18n]);

  // Search / Sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<TournamentSortOption>("date-soonest");

  // Category filter state
  type Category = "upcoming" | "ongoing" | "past";
  const [category, setCategory] = useState<Category>("upcoming");

  // SortBy handles dropdown state and outside click behavior

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
          <div
            className="mb-6 flex w-full max-w-[800px] mx-auto items-center gap-3 search-controls"
            dir={i18n.dir()}
          >
            <input
              type="text"
              ref={searchRef}
              placeholder={
                isMobile
                  ? t("common.search")
                  : t("tournaments.searchPlaceholder")
              }
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
            {/* Mobile search icon button */}
            <button
              type="button"
              aria-label={t("common.search")}
              className={`sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-cyan-300 transition-all ${
                i18n.dir() === "rtl" ? "mr-auto" : "ml-auto"
              }`}
              onClick={() => searchRef.current?.focus()}
            >
              <IconSearch />
            </button>

            {/* Sort dropdown hidden on mobile */}
            <div className="relative w-[140px] sort-container hidden sm:block">
              <SortBy
                options={tournamentSortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as TournamentSortOption)}
                placeholderKey={"tournaments.sort.placeholder"}
              />
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
