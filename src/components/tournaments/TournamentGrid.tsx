import { useTranslation } from "react-i18next";
import { Card } from "../shared";
import EmptyState from "../../states/EmptyState";
import type { Tournament } from "../../types/tournaments";
import { formatPrizePool } from "../../types/tournaments";

interface TournamentGridProps {
  tournaments: Tournament[];
  loading?: boolean;
  error?: string | null;
  onTournamentClick?: (tournament: Tournament) => void;
}

const TournamentGrid: React.FC<TournamentGridProps> = ({
  tournaments,
  loading = false,
  error = null,
  onTournamentClick,
}) => {
  const { t } = useTranslation();

  // Map tournament status to Card ActivityVariant
  const getCardVariant = (status: string): "upcoming" | "ongoing" | "past" => {
    switch (status) {
      case "UPCOMING":
      case "REGISTRATION_OPEN":
        return "upcoming";
      case "IN_PROGRESS":
        return "ongoing";
      case "COMPLETED":
      case "CANCELLED":
        return "past";
      default:
        return "upcoming";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-dark-secondary rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="h-3 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-600 rounded w-20"></div>
              <div className="h-3 bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title={t("tournaments:error.title")}
        description={error}
        actionLabel={t("common.tryAgain")}
        onAction={() => window.location.reload()}
      />
    );
  }

  if (tournaments.length === 0) {
    return (
      <EmptyState
        title={t("tournaments:empty.title")}
        description={t("tournaments:empty.description")}
        actionLabel={t("tournaments:create.button")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          onClick={() => onTournamentClick?.(tournament)}
          className="cursor-pointer"
        >
          <Card
            preset="tournament"
            variant={getCardVariant(tournament.status)}
            game={tournament.gameTitle}
            organizer={tournament.organizer.displayName}
            startDate={tournament.startDate}
            prizePool={formatPrizePool(
              tournament.prizePool,
              tournament.currency
            )}
            playersJoined={tournament.currentParticipants}
          />
        </div>
      ))}
    </div>
  );
};

export default TournamentGrid;
