import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackgroundDecor,
  Card,
  SortBy,
  IconSearch,
  CategoryButtons,
} from "../components";
import EmptyState from "../states/EmptyState";
import { events, eventSortOptions, type EventSortOption } from "../data";
import { useIsMobile, useDebounce } from "../hooks";

export default function Events() {
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);
  // Search / Sort state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<EventSortOption>("date-soonest");
  // SortBy handles dropdown state and outside clicks

  // Category filter state
  type Category = "upcoming" | "ongoing" | "past";
  const [category, setCategory] = useState<Category>("upcoming");

  // SortBy handles dropdown state and outside clicks

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
            {t("pages.events")}
          </h1>
        </header>

        {/* Category Filter */}
        <CategoryButtons
          category={category}
          onCategoryChange={setCategory}
          translationPrefix="events"
        />

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
                isMobile ? t("common.search") : t("events.searchPlaceholder")
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
                options={eventSortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as EventSortOption)}
                placeholderKey={"events.sort.placeholder"}
              />
            </div>
          </div>
        </section>

        {/* Placeholder grid for event cards (cards to be added later) */}
        <section
          className={`grid grid-cols-1 justify-items-center gap-8 products-grid min-[900px]:grid-cols-2 xl:grid-cols-3 md:gap-6 sm:gap-4 mt-8 md:mt-6 relative z-0`}
        >
          {events
            .filter((e) => e.category === category)
            .filter((e) =>
              [e.name, e.organizer, e.location]
                .join(" ")
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
            )
            .sort((a, b) => {
              const collator = new Intl.Collator(
                i18n.language === "ar" ? "ar" : "en",
                { sensitivity: "base" }
              );
              switch (sortBy) {
                case "date-soonest":
                  return (
                    new Date(a.scheduledOn).getTime() -
                    new Date(b.scheduledOn).getTime()
                  );
                case "date-latest":
                  return (
                    new Date(b.scheduledOn).getTime() -
                    new Date(a.scheduledOn).getTime()
                  );
                case "name":
                  return collator.compare(a.name, b.name);
                case "organizer":
                  return collator.compare(a.organizer, b.organizer);
                case "location":
                  return collator.compare(a.location, b.location);
                default:
                  return 0;
              }
            })
            .map((ev) => (
              <Card
                key={ev.id}
                preset="event"
                variant={ev.category}
                name={ev.name}
                organizer={ev.organizer}
                scheduledOn={new Date(ev.scheduledOn).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
                location={ev.location}
              />
            ))
            .concat(
              events
                .filter((e) => e.category === category)
                .filter((e) =>
                  [e.name, e.organizer, e.location]
                    .join(" ")
                    .toLowerCase()
                    .includes(debouncedSearchTerm.toLowerCase())
                ).length === 0
                ? [
                    <div key="empty" className="col-span-full w-full max-w-2xl">
                      <EmptyState
                        icon={
                          <svg
                            className="w-10 h-10 text-cyan-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 6h18M3 12h18M3 18h18" />
                          </svg>
                        }
                        title={t("common.noResults") || "No results"}
                        description={
                          t("events.noMatches") ||
                          "Try adjusting your search or filters."
                        }
                        actionLabel={t("common.clearSearch") || "Clear search"}
                        onAction={() => {
                          setSearchTerm("");
                          searchRef.current?.focus();
                        }}
                      />
                    </div>,
                  ]
                : []
            )}
        </section>
      </div>
    </main>
  );
}
