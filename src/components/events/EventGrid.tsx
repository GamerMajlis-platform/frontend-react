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
          title={t("common.noResults")}
          description={t("events:noMatches")}
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
            ? t("events:locationTypes.VIRTUAL")
            : event.locationType === "PHYSICAL"
            ? event.physicalVenue ||
              event.physicalAddress ||
              t("events:locationTypes.PHYSICAL")
            : t("events:locationTypes.HYBRID");

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
