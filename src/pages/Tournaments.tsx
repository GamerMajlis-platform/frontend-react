import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackgroundDecor,
  SortBy,
  IconSearch,
  CategoryButtons,
} from "../components";
import {
  TournamentGrid,
  CreateTournamentForm,
} from "../components/tournaments";
import TournamentService from "../services/TournamentService";
import type { Tournament, TournamentSortOption } from "../types/tournaments";
import { useIsMobile, useDebounce } from "../hooks";

// Tournament sort options for SortBy component
const tournamentSortOptions = [
  { value: "date-soonest", labelKey: "tournaments:sort.dateSoonest" },
  { value: "date-latest", labelKey: "tournaments:sort.dateLatest" },
  { value: "prize-highest", labelKey: "tournaments:sort.prizeHighest" },
  { value: "prize-lowest", labelKey: "tournaments:sort.prizeLowest" },
  { value: "participants-most", labelKey: "tournaments:sort.participantsMost" },
  {
    value: "participants-least",
    labelKey: "tournaments:sort.participantsLeast",
  },
];

export default function Tournaments() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);
  const [nsReady, setNsReady] = useState(false);

  // Tournament data state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);

  // Search / Sort state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<TournamentSortOption>("date-soonest");

  // Category filter state
  type Category = "upcoming" | "ongoing" | "past";
  const [category, setCategory] = useState<Category>("upcoming");

  // Ensure translation namespace is loaded
  useEffect(() => {
    const ns = Array.isArray(i18n.options.defaultNS)
      ? i18n.options.defaultNS[0]
      : (i18n.options.defaultNS as string) || "translation";
    i18n
      .loadNamespaces(ns)
      .then(() => setNsReady(true))
      .catch(() => setNsReady(true));
  }, [i18n]);

  // Load tournaments
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TournamentService.listTournaments({
          page: 1,
          size: 50,
          sortBy,
        });
        setTournaments(data.tournaments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("tournaments:error.loadFailed")
        );
      } finally {
        setLoading(false);
      }
    };

    if (nsReady) {
      loadTournaments();
    }
  }, [nsReady, sortBy, t]);

  // Handle tournament creation
  const handleTournamentCreated = (newTournament: Tournament) => {
    setTournaments((prev) => [newTournament, ...prev]);
    setShowCreateForm(false);
  };

  // Filter and sort tournaments
  const filteredTournaments = tournaments
    .filter((tournament) => {
      // Filter by category
      switch (category) {
        case "upcoming":
          return ["UPCOMING", "REGISTRATION_OPEN"].includes(tournament.status);
        case "ongoing":
          return tournament.status === "IN_PROGRESS";
        case "past":
          return ["COMPLETED", "CANCELLED"].includes(tournament.status);
        default:
          return true;
      }
    })
    .filter((tournament) => {
      // Filter by search term
      if (!debouncedSearchTerm) return true;
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        tournament.name.toLowerCase().includes(searchLower) ||
        tournament.gameTitle.toLowerCase().includes(searchLower) ||
        tournament.organizer.displayName.toLowerCase().includes(searchLower)
      );
    });

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  if (!nsReady) return null;

  return (
    <main className="relative z-10 min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1C2541] py-4 sm:py-6 lg:py-8 tournaments-container">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 max-width-container">
        {/* Page Header - Centered like reference */}
        <header className="mb-6 sm:mb-8 flex w-full items-center justify-center py-4 sm:py-6 tournaments-header">
          <h1 className="font-alice text-[32px] sm:text-[40px] lg:text-[56px] leading-tight text-white tournaments-title text-center">
            {t("nav.tournaments")}
          </h1>
        </header>

        {/* Category Filter - Moved below header like reference */}
        <CategoryButtons
          category={category}
          onCategoryChange={setCategory}
          translationPrefix="tournaments"
        />

        {/* Search and Sort controls */}
        <section className="mb-8 search-section md:mb-6 relative z-10">
          <div
            className={`mb-6 flex w-full max-w-[900px] mx-auto items-center gap-4 search-controls`}
            dir={i18n.dir()}
          >
            {/* + button: will be ordered explicitly per dir */}
            <div
              className={`flex items-center ${
                i18n.dir() === "rtl" ? "order-3" : "order-1"
              }`}
            >
              <button
                onClick={() => setShowCreateForm(true)}
                className="self-center -mt-1 text-white font-extrabold text-4xl hover:opacity-80 transition-opacity px-3 w-12 h-12 flex items-center justify-center"
                type="button"
                aria-label={t("tournaments:create.button")}
                title={t("tournaments:create.button")}
              >
                +
              </button>
            </div>

            {/* Search Input: center */}
            <div className={`flex-1 ${"order-2"}`}>
              <div className="relative">
                <input
                  type="text"
                  ref={searchRef}
                  placeholder={
                    isMobile
                      ? t("common.search")
                      : t("tournaments:searchPlaceholder")
                  }
                  className={`h-12 w-full rounded-xl border border-slate-600 bg-[#1C2541] px-4 py-3 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] focus:outline-none search-input ${
                    i18n.dir() === "rtl" ? "pl-12" : "pr-12"
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${
                    i18n.dir() === "rtl" ? "left-3" : "right-3"
                  }`}
                >
                  <IconSearch />
                </div>
              </div>
            </div>

            {/* Sort dropdown: right in LTR, left in RTL */}
            <div
              className={`relative w-[180px] sort-container hidden sm:block ${
                i18n.dir() === "rtl" ? "order-1" : "order-3"
              }`}
            >
              <SortBy
                options={tournamentSortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as TournamentSortOption)}
                placeholderKey={"tournaments:sort.placeholder"}
              />
            </div>

            {/* Mobile sort button */}
            <button
              onClick={() => setShowMobileSortModal(true)}
              className={`sm:hidden flex items-center justify-center w-12 h-12 rounded-xl border bg-[#1C2541] border-slate-600 text-white transition-all ${
                i18n.dir() === "rtl" ? "order-1" : "order-3"
              }`}
              aria-label={t("tournaments:sort.placeholder")}
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
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* Mobile Sort Modal */}
        {showMobileSortModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMobileSortModal(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C2541] border-t border-slate-600 rounded-t-3xl p-6 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {t("tournaments:sort.placeholder")}
                </h3>
                <button
                  onClick={() => setShowMobileSortModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {tournamentSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as TournamentSortOption);
                      setShowMobileSortModal(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      sortBy === option.value
                        ? "bg-cyan-500 text-black font-medium"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Create Tournament Form (inline, like Events) */}
        {showCreateForm && (
          <section className="max-w-[800px] mx-auto mb-12">
            <CreateTournamentForm
              onSuccess={handleTournamentCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </section>
        )}

        {/* Tournament Grid */}
        <TournamentGrid
          tournaments={filteredTournaments}
          loading={loading}
          error={error}
          onTournamentClick={(tournament: Tournament) => {
            console.log("Tournament clicked:", tournament);
            // TODO: Navigate to tournament details page
          }}
        />
      </div>
    </main>
  );
}
