import { useTranslation } from "react-i18next";
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
          icon={
            <svg
              className="w-10 h-10 text-cyan-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
              <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
            </svg>
          }
          title={t("common.noResults")}
          description={t("events.noMatches")}
        />
      </div>
    );
  }

  return (
    <>
      {events.map((event) => {
        // Format the event data for the shared Card component
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

        // Determine the location display
        const locationDisplay =
          event.locationType === "VIRTUAL"
            ? t("events.locationTypes.VIRTUAL")
            : event.locationType === "PHYSICAL"
            ? event.physicalVenue ||
              event.physicalAddress ||
              t("events.locationTypes.PHYSICAL")
            : t("events.locationTypes.HYBRID");

        // Determine status-based variant for visual indication
        const getEventVariant = (): ActivityVariant => {
          const now = new Date();
          const startDate = new Date(event.startDateTime);
          const endDate = event.endDateTime
            ? new Date(event.endDateTime)
            : null;

          if (event.status === "COMPLETED" || (endDate && endDate < now))
            return "past";
          if (
            event.status === "LIVE" ||
            (startDate <= now && (!endDate || endDate > now))
          )
            return "ongoing";
          return "upcoming";
        };

        // Combine date and time for display
        const combinedDateTime = `${formattedDate} ${formattedTime}`;

        return (
          <Card
            key={event.id}
            preset="event"
            variant={getEventVariant()}
            name={event.title}
            organizer={event.organizer.displayName}
            scheduledOn={combinedDateTime}
            location={locationDisplay}
            imageUrl={event.organizer.profilePictureUrl}
          />
        );
      })}
    </>
  );
}
