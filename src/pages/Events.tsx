import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BackgroundDecor,
  SortBy,
  IconSearch,
  CategoryButtons,
  CreateEventForm,
  EventGrid,
} from "../components";
import { useIsMobile, useDebounce } from "../hooks";
import { useApi } from "../hooks/useApi";
import EventService from "../services/EventService";
import type {
  Event,
  EventFilters,
  EventsListResponse,
  EventCategoryFilter,
  EventSortOption,
  CreateEventRequest,
} from "../types/events";

export default function Events() {
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);

  // Search / Sort state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<EventSortOption>("date-soonest");

  // Category filter state
  const [category, setCategory] = useState<EventCategoryFilter>("upcoming");

  // Create event UI state
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load events from backend
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    execute: executeLoadEvents,
  } = useApi<EventsListResponse>(null);

  // Get events list with proper type
  const events: Event[] = eventsData?.events || [];

  // Build filters for API call
  const buildFilters = (): EventFilters => {
    const filters: EventFilters = {
      page: 0,
      size: 20,
    };

    // Category-based filters
    if (category === "upcoming") {
      filters.upcoming = true;
    } else if (category === "my-events") {
      filters.myEvents = true;
    }

    // Search query
    if (debouncedSearchTerm) {
      filters.query = debouncedSearchTerm;
    }

    return filters;
  };

  // Fetch events
  const fetchEvents = async () => {
    const filters = buildFilters();

    if (debouncedSearchTerm) {
      // Use search API for text queries
      await executeLoadEvents(() =>
        EventService.searchEvents(debouncedSearchTerm, filters)
      );
    } else {
      // Use regular list API
      await executeLoadEvents(() => EventService.listEvents(filters));
    }
  };

  // Effect to load events when filters change
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearchTerm]);

  // Sort events client-side
  const sortedEvents = [...events].sort((a, b) => {
    const collator = new Intl.Collator(i18n.language === "ar" ? "ar" : "en", {
      sensitivity: "base",
    });

    switch (sortBy) {
      case "date-soonest":
        return (
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime()
        );
      case "date-latest":
        return (
          new Date(b.startDateTime).getTime() -
          new Date(a.startDateTime).getTime()
        );
      case "name":
        return collator.compare(a.title, b.title);
      case "organizer":
        return collator.compare(
          a.organizer.displayName,
          b.organizer.displayName
        );
      case "attendees-most":
        return b.currentAttendees - a.currentAttendees;
      case "attendees-least":
        return a.currentAttendees - b.currentAttendees;
      case "created-latest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "created-oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  // Handle create event
  const handleCreateEvent = async (data: CreateEventRequest) => {
    setIsCreating(true);
    try {
      await EventService.createEvent(data);
      setShowCreate(false);
      await fetchEvents(); // Refresh the list
    } finally {
      setIsCreating(false);
    }
  };

  // Search focus/blur handlers
  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  // Sort options for the dropdown
  const eventSortOptions: Array<{ value: EventSortOption; label: string }> = [
    { value: "date-soonest", label: t("events:sort.date-soonest") },
    { value: "date-latest", label: t("events:sort.date-latest") },
    { value: "name", label: t("events:sort.name") },
    { value: "organizer", label: t("events:sort.organizer") },
    { value: "attendees-most", label: t("events:sort.attendees-most") },
    { value: "attendees-least", label: t("events:sort.attendees-least") },
    { value: "created-latest", label: t("events:sort.created-latest") },
    { value: "created-oldest", label: t("events:sort.created-oldest") },
  ];

  return (
    <main className="relative z-10 min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1C2541] py-4 sm:py-6 lg:py-8 events-container">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 max-width-container">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8 flex w-full items-center justify-center py-4 sm:py-6 events-header">
          <h1 className="font-alice text-[32px] sm:text-[40px] lg:text-[56px] leading-tight text-white events-title text-center">
            {t("pages.events")}
          </h1>
        </header>

        {/* Category Filter */}
        <CategoryButtons
          category={category as "upcoming" | "ongoing" | "past"} // Map to expected type
          onCategoryChange={(cat) => setCategory(cat as EventCategoryFilter)}
          translationPrefix="events"
        />

        {/* Search and Sort controls */}
        <section className="mb-12 search-section md:mb-8 relative z-10">
          <div
            className="mb-6 flex w-full max-w-[800px] mx-auto items-center gap-3 search-controls"
            dir={i18n.dir()}
          >
            <input
              type="text"
              ref={searchRef}
              placeholder={
                isMobile ? t("common.search") : t("events:searchPlaceholder")
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
                placeholderKey="events:sort.placeholder"
              />
            </div>
          </div>
        </section>

        {/* Create Event Toggle */}
        <div className="mb-6 flex justify-center">
          <button
            className="rounded-xl bg-cyan-500 px-6 py-3 text-white font-medium hover:bg-cyan-600 transition-colors"
            onClick={() => setShowCreate(!showCreate)}
            type="button"
          >
            {showCreate ? t("events:closeCreate") : t("events:create")}
          </button>
        </div>

        {/* Create Event Form */}
        {showCreate && (
          <div className="mb-8">
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreate(false)}
              isSubmitting={isCreating}
            />
          </div>
        )}

        {/* Events Grid */}
        <section className="grid grid-cols-1 justify-items-center gap-8 events-grid min-[900px]:grid-cols-2 xl:grid-cols-3 md:gap-6 sm:gap-4 mt-8 md:mt-6 relative z-0">
          <EventGrid
            events={sortedEvents}
            loading={eventsLoading}
            error={eventsError || undefined}
            onRetry={fetchEvents}
          />
        </section>
      </div>
    </main>
  );
}
