import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../shared";
import type { Event } from "../../types/events";
import type { ActivityVariant } from "../shared/Card";
import EmptyState from "../../states/EmptyState";

interface EventGridProps {
  events: Event[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function EventGrid({
  events,
  loading = false,
  error,
  onRetry,
}: EventGridProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="col-span-full w-full max-w-2xl mx-auto">
        <EmptyState title={t("common.loading")} description="" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full w-full max-w-2xl mx-auto">
        <EmptyState
          title={t("common.error")}
          description={error}
          actionLabel={t("common.retry")}
          onAction={onRetry}
        />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="col-span-full w-full max-w-2xl mx-auto">
        <EmptyState
          title={t("common.noResults")}
          description={t("events:noMatches")}
        />
      </div>
    );
  }

  return (
    <>
      {events.map((event) => {
        const eventDate = new Date(event.startDateTime);
        const formattedDate = eventDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const formattedTime = eventDate.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        const locationDisplay =
          event.locationType === "VIRTUAL"
            ? t("events:locationTypes.VIRTUAL")
            : event.locationType === "PHYSICAL"
            ? event.physicalVenue ||
              event.physicalAddress ||
              t("events:locationTypes.PHYSICAL")
            : t("events:locationTypes.HYBRID");

        const getEventVariant = (): ActivityVariant => {
          // Map backend status to UI categories:
          // - Upcoming: DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED
          // - Ongoing: ACTIVE, LIVE, PAUSED
          // - Past: COMPLETED, CANCELLED

          if (event.status === "COMPLETED" || event.status === "CANCELLED") {
            return "past";
          }

          if (
            event.status === "ACTIVE" ||
            event.status === "LIVE" ||
            event.status === "PAUSED"
          ) {
            return "ongoing";
          }

          if (
            event.status === "DRAFT" ||
            event.status === "REGISTRATION_OPEN" ||
            event.status === "REGISTRATION_CLOSED"
          ) {
            return "upcoming";
          }

          // Fallback to date-based logic if status is unexpected
          const now = new Date();
          const startDate = new Date(event.startDateTime);
          const endDate = event.endDateTime
            ? new Date(event.endDateTime)
            : null;

          if (endDate && endDate < now) return "past";
          if (startDate <= now && (!endDate || endDate > now)) return "ongoing";
          return "upcoming";
        };

        const combinedDateTime = `${formattedDate} ${formattedTime}`;

        return (
          <Card
            key={event.id}
            preset="event"
            eventId={event.id}
            variant={getEventVariant()}
            name={event.title}
            organizer={event.organizer.displayName}
            scheduledOn={combinedDateTime}
            location={locationDisplay}
            imageUrl={event.organizer.profilePictureUrl}
            onClick={() =>
              navigate(`/events/${event.id}`, {
                state: { from: "events", scrollY: window.scrollY },
              })
            }
          />
        );
      })}
    </>
  );
}
