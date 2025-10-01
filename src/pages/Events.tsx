import { useRef, useState, useEffect, useMemo, useCallback } from "react";
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
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);

  // Load events from backend
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    execute: executeLoadEvents,
    setData,
  } = useApi<EventsListResponse>(null);

  // Get events list with proper type (memoized to prevent unnecessary re-renders)
  const events: Event[] = useMemo(
    () => eventsData?.events || [],
    [eventsData?.events]
  );

  // Memoized date helper functions for event status
  const isEventOngoing = useCallback((event: Event): boolean => {
    // Ongoing = ACTIVE, LIVE, or PAUSED status
    // These are events currently happening or temporarily paused
    if (
      event.status === "ACTIVE" ||
      event.status === "LIVE" ||
      event.status === "PAUSED"
    ) {
      return true;
    }

    // Additional date-based check as fallback
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = event.endDateTime ? new Date(event.endDateTime) : null;

    if (endDate) {
      return startDate <= now && now <= endDate;
    }
    // If no end date, consider ongoing if started within last 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return startDate <= now && startDate >= twentyFourHoursAgo;
  }, []);

  const isEventPast = useCallback(
    (event: Event): boolean => {
      // Past = COMPLETED or CANCELLED status
      if (event.status === "COMPLETED" || event.status === "CANCELLED") {
        return true;
      }

      // Date-based check as fallback
      const now = new Date();
      const endDate = event.endDateTime
        ? new Date(event.endDateTime)
        : new Date(event.startDateTime);
      return endDate < now && !isEventOngoing(event);
    },
    [isEventOngoing]
  );

  const isEventUpcoming = useCallback(
    (event: Event): boolean => {
      // Upcoming = DRAFT, REGISTRATION_OPEN, or REGISTRATION_CLOSED
      // These are events that haven't started yet
      if (
        event.status === "DRAFT" ||
        event.status === "REGISTRATION_OPEN" ||
        event.status === "REGISTRATION_CLOSED"
      ) {
        return true;
      }

      // Date-based check as fallback
      const now = new Date();
      const startDate = new Date(event.startDateTime);
      return startDate > now && !isEventOngoing(event) && !isEventPast(event);
    },
    [isEventOngoing, isEventPast]
  );
  // Note: isEventUpcoming available for future use (currently backend filters "upcoming" server-side)

  // Client-side filtering based on category (for "all", "ongoing", "past")
  // Server handles "upcoming" and "my-events" via API filters
  const filteredEvents = useMemo(() => {
    // Safety check
    if (!events || events.length === 0) {
      return [];
    }

    // For "upcoming" and "my-events", server-side filtering is already applied
    if (category === "upcoming" || category === "my-events") {
      return events;
    }

    if (category === "all") {
      return events;
    }

    if (category === "ongoing") {
      const filtered = events.filter(isEventOngoing);
      console.debug(
        `Filtered ${filtered.length} ongoing events (ACTIVE/LIVE/PAUSED) from ${events.length} total`
      );
      return filtered;
    }

    if (category === "past") {
      const filtered = events.filter(isEventPast);
      console.debug(
        `Filtered ${filtered.length} past events (COMPLETED/CANCELLED) from ${events.length} total`
      );
      return filtered;
    }

    return events;
  }, [events, category, isEventOngoing, isEventPast]);

  // Memoized sorting with locale-aware collator
  const sortedEvents = useMemo(() => {
    const collator = new Intl.Collator(i18n.language === "ar" ? "ar" : "en", {
      sensitivity: "base",
    });

    return [...filteredEvents].sort((a, b) => {
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
  }, [filteredEvents, sortBy, i18n.language]);

  // Build filters for API call
  const buildFilters = useCallback((): EventFilters => {
    const filters: EventFilters = {
      page: 0,
      size: 100, // Larger size for client-side filtering
    };

    // Backend only supports 'upcoming' and 'myEvents' filters
    // For other categories, fetch all events and filter client-side
    if (category === "upcoming") {
      filters.upcoming = true;
    } else if (category === "my-events") {
      filters.myEvents = true;
    }
    // For "all", "ongoing", "past": fetch without filters, then filter client-side
    // This is not ideal but backend doesn't support status-based filters yet

    // Search query
    if (debouncedSearchTerm) {
      filters.query = debouncedSearchTerm;
    }

    return filters;
  }, [category, debouncedSearchTerm]);

  // Fetch events with useCallback for stability
  const fetchEvents = useCallback(async () => {
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
  }, [buildFilters, debouncedSearchTerm, executeLoadEvents]);

  // Effect to load events when filters change
  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      if (mounted) {
        await fetchEvents();
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearchTerm]);

  // Handle create event
  const handleCreateEvent = useCallback(
    async (data: CreateEventRequest) => {
      setIsCreating(true);
      try {
        console.debug("Events.handleCreateEvent called", { data });
        const res = await EventService.createEvent(data);
        console.debug("Events.createEvent response", { res });
        setShowCreate(false);

        const createdEvent = res?.event;
        if (createdEvent) {
          // Temporary workaround: prepend the created event to local state because
          // the GET /api/events list endpoint is currently broken. This avoids
          // relying on the backend until the backend team fixes the list API.
          const current = eventsData?.events || [];
          const updatedList: EventsListResponse = {
            success: true,
            message: res.message || "",
            events: [createdEvent, ...current],
            totalElements: (eventsData?.totalElements || 0) + 1,
            totalPages: eventsData?.totalPages || 1,
            currentPage: eventsData?.currentPage || 0,
            pageSize: eventsData?.pageSize || 20,
          };
          // setData is provided by the useApi hook
          setData(updatedList);
        } else {
          // Fallback: try to refresh the list if API didn't return the event
          await fetchEvents();
        }
      } catch (err) {
        // Surface error in console for debugging and rethrow so caller can handle
        console.error("Events.handleCreateEvent error:", err);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [eventsData, setData, fetchEvents]
  );

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
                onClick={() => setShowCreate(true)}
                className="self-center -mt-1 text-white font-extrabold text-4xl hover:opacity-80 transition-opacity px-3 w-12 h-12 flex items-center justify-center"
                type="button"
                aria-label={t("events:create")}
                title={t("events:create")}
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
                      : t("events:searchPlaceholder")
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
                options={eventSortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as EventSortOption)}
                placeholderKey="events:sort.placeholder"
              />
            </div>

            {/* Mobile sort button */}
            <button
              onClick={() => setShowMobileSortModal(true)}
              className={`sm:hidden flex items-center justify-center w-12 h-12 rounded-xl border bg-[#1C2541] border-slate-600 text-white transition-all ${
                i18n.dir() === "rtl" ? "order-1" : "order-3"
              }`}
              aria-label={t("events:sort.placeholder")}
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
                  {t("events:sort.placeholder")}
                </h3>
                <button
                  onClick={() => setShowMobileSortModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {eventSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as EventSortOption);
                      setShowMobileSortModal(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      sortBy === option.value
                        ? "bg-cyan-500 text-black font-medium"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

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
