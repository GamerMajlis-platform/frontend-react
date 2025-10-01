import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Share2,
} from "lucide-react";
import EventService from "../services/EventService";
import type { Event } from "../types/events";
import { BackgroundDecor } from "../components";
import { getUploadUrl } from "../lib/urls";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["events", "activity", "common"]);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Get navigation state for back button
  const state = location.state as { from?: string; scrollY?: number } | null;
  const sourcePage = state?.from || "events";
  const scrollY = state?.scrollY;

  // Restore scroll position when returning from details
  useEffect(() => {
    if (scrollY !== undefined) {
      window.scrollTo(0, scrollY);
    }
  }, [scrollY]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await EventService.getEvent(Number(id));
        if (res && res.event) {
          setEvent(res.event);
          // TODO: Check if user is already registered
        } else setError(res?.message || t("common.error"));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await EventService.registerForEventWithValidation(event.id, {
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees,
        startDateTime: event.startDateTime,
      });
      // Optimistic update
      setEvent((e) =>
        e ? { ...e, currentAttendees: e.currentAttendees + 1 } : e
      );
      setIsRegistered(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("common.error"));
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    setRegistering(true);
    try {
      await EventService.unregisterFromEvent(event.id);
      setEvent((e) =>
        e ? { ...e, currentAttendees: Math.max(0, e.currentAttendees - 1) } : e
      );
      setIsRegistered(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("common.error"));
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback to copy
          navigator.clipboard.writeText(window.location.href);
          setShowShareTooltip(true);
          setTimeout(() => setShowShareTooltip(false), 2000);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if registration is allowed based on event status
  const canRegister = event?.status === "REGISTRATION_OPEN";
  const registrationClosed = event?.status === "REGISTRATION_CLOSED";
  const eventIsLive = event?.status === "LIVE" || event?.status === "ACTIVE";
  const eventCompleted = event?.status === "COMPLETED";
  const eventCancelled = event?.status === "CANCELLED";
  const eventDraft = event?.status === "DRAFT";

  const isFull =
    event && event.maxAttendees
      ? event.currentAttendees >= event.maxAttendees
      : false;
  const spotsLeft =
    event && event.maxAttendees
      ? Math.max(0, event.maxAttendees - event.currentAttendees)
      : 0;

  // Determine registration button state and message
  const getRegistrationStatus = () => {
    if (eventCancelled)
      return {
        disabled: true,
        message: t("events.cancelled", "Event Cancelled"),
      };
    if (eventCompleted)
      return {
        disabled: true,
        message: t("events.completed", "Event Completed"),
      };
    if (eventDraft)
      return { disabled: true, message: t("events.draft", "Event Draft") };
    if (eventIsLive)
      return { disabled: true, message: t("events.live", "Event In Progress") };
    if (registrationClosed)
      return {
        disabled: true,
        message: t("events.registrationClosed", "Registration Closed"),
      };
    if (isFull)
      return { disabled: true, message: t("events.eventFull", "Event Full") };
    if (!canRegister)
      return {
        disabled: true,
        message: t("events.registrationNotOpen", "Registration Not Open"),
      };
    return {
      disabled: false,
      message: t("events.register", "Register for Event"),
    };
  };

  const registrationStatus = getRegistrationStatus();

  // Determine button config based on event state
  const getButtonConfig = () => {
    if (eventCompleted) {
      return {
        action: "view",
        label: t("activity.viewResults", "View Results"),
        icon: AlertCircle,
        disabled: false,
      };
    }
    if (eventIsLive) {
      return {
        action: "watch",
        label: t("activity.watch", "Watch"),
        icon: CheckCircle,
        disabled: false,
      };
    }
    // Upcoming - use registration status
    return {
      action: "register",
      label: registrationStatus.message,
      icon: CheckCircle,
      disabled: registrationStatus.disabled,
    };
  };

  const buttonConfig = getButtonConfig();

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-dark)] relative">
        <BackgroundDecor />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--color-text)]">
              {t("common.loading", "Loading...")}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[var(--color-dark)] relative">
        <BackgroundDecor />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/${sourcePage}`, { state: { scrollY } })}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            {t("common.back", "Back")}
          </button>
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">
              {error || t("events.notFound", "Event not found")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-dark)] relative">
      <BackgroundDecor />
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/${sourcePage}`, { state: { scrollY } })}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            {t("common.back", "Back")}
          </button>
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 bg-[var(--color-dark-secondary)]/60 hover:bg-[var(--color-dark-secondary)] border border-[var(--color-border)] rounded-lg transition-all"
              aria-label="Share event"
            >
              <Share2 className="w-5 h-5 text-cyan-400" />
            </button>
            {showShareTooltip && (
              <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 bg-green-500 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                {t("common.copiedToClipboard", "Copied to clipboard!")}
              </div>
            )}
          </div>
        </div>

        {/* Event Card */}
        <div className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Title & Status */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] font-[Alice-Regular,serif]">
                  {event.title}
                </h1>
                {/* Status Badge */}
                {eventCancelled ? (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/50 whitespace-nowrap">
                    {t("events.cancelled", "Cancelled")}
                  </span>
                ) : eventCompleted ? (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm font-semibold rounded-full border border-gray-500/50 whitespace-nowrap">
                    {t("events.completed", "Completed")}
                  </span>
                ) : eventIsLive ? (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/50 whitespace-nowrap">
                    {t("events.live", "Live")}
                  </span>
                ) : eventDraft ? (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-semibold rounded-full border border-yellow-500/50 whitespace-nowrap">
                    {t("events.draft", "Draft")}
                  </span>
                ) : isFull ? (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/50 whitespace-nowrap">
                    {t("events.full", "Full")}
                  </span>
                ) : isRegistered ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full border border-green-500/50 whitespace-nowrap">
                    {t("events.registered", "Registered")}
                  </span>
                ) : registrationClosed ? (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/50 whitespace-nowrap">
                    {t("events.registrationClosed", "Registration Closed")}
                  </span>
                ) : canRegister && spotsLeft > 0 ? (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/50 whitespace-nowrap">
                    {t("events.spotsLeft", "{{count}} spots left", {
                      count: spotsLeft,
                    })}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm font-semibold rounded-full border border-gray-500/50 whitespace-nowrap">
                    {t("events.registrationNotOpen", "Registration Not Open")}
                  </span>
                )}
              </div>
              <p
                className="text-[var(--color-text-secondary)] text-lg leading-relaxed"
                dir="auto"
              >
                {event.description}
              </p>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Date */}
              <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[var(--color-border)]">
                <Calendar className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {t("events.date", "Date")}
                  </div>
                  <div className="text-[var(--color-text)] font-medium">
                    {formatDate(event.startDateTime)}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[var(--color-border)]">
                <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {t("events.time", "Time")}
                  </div>
                  <div className="text-[var(--color-text)] font-medium">
                    {formatTime(event.startDateTime)}
                    {event.endDateTime && ` - ${formatTime(event.endDateTime)}`}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[var(--color-border)]">
                <MapPin className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {t("events.location", "Location")}
                  </div>
                  <div className="text-[var(--color-text)] font-medium">
                    {event.locationType === "VIRTUAL"
                      ? event.virtualPlatform ||
                        event.virtualLink ||
                        t("events.online", "Online")
                      : event.physicalVenue ||
                        event.physicalAddress ||
                        t("events.inPerson", "In Person")}
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-[var(--color-border)]">
                <Users className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {t("events.attendees", "Attendees")}
                  </div>
                  <div className="text-[var(--color-text)] font-medium">
                    {event.currentAttendees} / {event.maxAttendees || "∞"}
                  </div>
                  {/* Progress bar */}
                  {event.maxAttendees && (
                    <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (event.currentAttendees / event.maxAttendees) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-[var(--color-border)] mb-6">
              <div className="flex items-center gap-3 flex-1">
                {event.organizer.profilePictureUrl ? (
                  <img
                    src={
                      getUploadUrl(event.organizer.profilePictureUrl) ||
                      event.organizer.profilePictureUrl
                    }
                    alt={event.organizer.displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {event.organizer.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {t("events.organizer", "Organized by")}
                  </div>
                  <div className="text-[var(--color-text)] font-medium">
                    {event.organizer.displayName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${event.organizer.id || ""}`)}
                className="px-4 py-2 border border-cyan-500/50 hover:bg-cyan-500/10 rounded-lg text-cyan-400 text-sm font-medium transition-all hover:scale-105"
              >
                <User className="w-4 h-4 inline ltr:mr-2 rtl:ml-2" />
                {t("events.viewProfile", "View Profile")}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isRegistered ? (
                <button
                  disabled={registering || buttonConfig.disabled}
                  onClick={
                    buttonConfig.action === "register"
                      ? handleRegister
                      : () => {}
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 rounded-xl font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-cyan-500/20"
                >
                  {registering ? (
                    t("common.loading", "Loading...")
                  ) : (
                    <>
                      <buttonConfig.icon className="w-5 h-5" />
                      {buttonConfig.label}
                    </>
                  )}
                </button>
              ) : eventCompleted ? (
                <button
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
                  onClick={() => {}}
                >
                  <AlertCircle className="w-5 h-5 inline ltr:mr-2 rtl:ml-2" />
                  {t("activity.viewResults", "View Results")}
                </button>
              ) : eventIsLive ? (
                <button
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                  onClick={() => {}}
                >
                  <CheckCircle className="w-5 h-5 inline ltr:mr-2 rtl:ml-2" />
                  {t("activity.watch", "Watch")}
                </button>
              ) : (
                <button
                  disabled={registering}
                  onClick={handleUnregister}
                  className="flex-1 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black disabled:text-gray-400 rounded-xl font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                >
                  {registering
                    ? t("common.loading", "Loading...")
                    : t("events.unregister", "Unregister")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
