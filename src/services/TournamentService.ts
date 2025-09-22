// Tournament Management Service
// Implements all Tournament Management APIs (#74-#87)

import { apiFetch } from "../lib/api";
import type {
  Tournament,
  TournamentFilters,
  TournamentsListResponse,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentParticipation,
  RegisterForTournamentResponse,
  SubmitMatchResultRequest,
  DisqualifyParticipantRequest,
} from "../types/tournaments";

class TournamentService {
  // ===== TOURNAMENT MANAGEMENT APIs (#74-#81) =====

  /**
   * #74 - Create Tournament
   * POST /api/tournaments
   */
  static async createTournament(
    data: CreateTournamentRequest
  ): Promise<Tournament> {
    return await apiFetch<Tournament>("/tournaments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * #75 - Get Tournament Details
   * GET /api/tournaments/{id}
   */
  static async getTournament(id: number): Promise<Tournament> {
    return await apiFetch<Tournament>(`/tournaments/${id}`);
  }

  /**
   * #76 - Update Tournament
   * PUT /api/tournaments/{id}
   */
  static async updateTournament(
    id: number,
    data: UpdateTournamentRequest
  ): Promise<Tournament> {
    return await apiFetch<Tournament>(`/tournaments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * #77 - Delete Tournament
   * DELETE /api/tournaments/{id}
   */
  static async deleteTournament(id: number): Promise<void> {
    await apiFetch<void>(`/tournaments/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * #78 - Get All Tournaments
   * GET /api/tournaments
   */
  static async listTournaments(
    filters: TournamentFilters = {}
  ): Promise<TournamentsListResponse> {
    const params = new URLSearchParams();

    // Add pagination
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());

    // Add search and filtering
    if (filters.search) params.append("search", filters.search);
    if (filters.gameTitle) params.append("gameTitle", filters.gameTitle);
    if (filters.status) params.append("status", filters.status);
    if (filters.prizeMin !== undefined)
      params.append("prizeMin", filters.prizeMin.toString());
    if (filters.prizeMax !== undefined)
      params.append("prizeMax", filters.prizeMax.toString());
    if (filters.startDateFrom)
      params.append("startDateFrom", filters.startDateFrom);
    if (filters.startDateTo) params.append("startDateTo", filters.startDateTo);

    // Add sorting
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const queryString = params.toString();
    const url = queryString ? `/tournaments?${queryString}` : "/tournaments";

    const data = await apiFetch<Tournament[] | TournamentsListResponse>(url);

    // Normalize response - handle both array and paginated responses
    if (Array.isArray(data)) {
      return {
        tournaments: data,
        total: data.length,
        page: 1,
        size: data.length,
        totalPages: 1,
      };
    }

    return data as TournamentsListResponse;
  }

  /**
   * #79 - Get Tournaments by Organizer
   * GET /api/tournaments/organizer/{organizerId}
   */
  static async getTournamentsByOrganizer(
    organizerId: number
  ): Promise<Tournament[]> {
    return await apiFetch<Tournament[]>(
      `/tournaments/organizer/${organizerId}`
    );
  }

  /**
   * #80 - Add Tournament Moderator
   * POST /api/tournaments/{id}/moderators?moderatorId={moderatorId}
   */
  static async addTournamentModerator(
    tournamentId: number,
    moderatorId: number
  ): Promise<void> {
    await apiFetch<void>(
      `/tournaments/${tournamentId}/moderators?moderatorId=${moderatorId}`,
      {
        method: "POST",
      }
    );
  }

  /**
   * #81 - Increment Tournament View Count
   * POST /api/tournaments/{id}/view
   */
  static async incrementTournamentView(tournamentId: number): Promise<void> {
    try {
      await apiFetch<void>(`/tournaments/${tournamentId}/view`, {
        method: "POST",
      });
    } catch {
      // Don't throw error for view count - it's not critical
      console.warn(
        `Failed to increment view count for tournament ${tournamentId}`
      );
    }
  }

  // ===== TOURNAMENT PARTICIPATION APIs (#82-#87) =====

  /**
   * #82 - Register for Tournament
   * POST /api/tournaments/{tournamentId}/participants/register?participantId={participantId}
   */
  static async registerForTournament(
    tournamentId: number,
    participantId: number
  ): Promise<RegisterForTournamentResponse> {
    return await apiFetch<RegisterForTournamentResponse>(
      `/tournaments/${tournamentId}/participants/register?participantId=${participantId}`,
      {
        method: "POST",
      }
    );
  }

  /**
   * #83 - Check-in Participant
   * POST /api/tournaments/{tournamentId}/participants/check-in?participantId={participantId}
   */
  static async checkInParticipant(
    tournamentId: number,
    participantId: number
  ): Promise<void> {
    await apiFetch<void>(
      `/tournaments/${tournamentId}/participants/check-in?participantId=${participantId}`,
      {
        method: "POST",
      }
    );
  }

  /**
   * #84 - Disqualify Participant
   * POST /api/tournaments/{tournamentId}/participants/disqualify?participantId={participantId}&reason={reason}
   */
  static async disqualifyParticipant(
    tournamentId: number,
    request: DisqualifyParticipantRequest
  ): Promise<void> {
    const params = new URLSearchParams({
      participantId: request.participantId.toString(),
      reason: request.reason,
    });

    await apiFetch<void>(
      `/tournaments/${tournamentId}/participants/disqualify?${params}`,
      {
        method: "POST",
      }
    );
  }

  /**
   * #85 - Submit Match Result
   * POST /api/tournaments/{tournamentId}/participants/submit-result?participantId={participantId}&won={won}
   */
  static async submitMatchResult(
    tournamentId: number,
    request: SubmitMatchResultRequest
  ): Promise<void> {
    const params = new URLSearchParams({
      participantId: request.participantId.toString(),
      won: request.won.toString(),
    });

    await apiFetch<void>(
      `/tournaments/${tournamentId}/participants/submit-result?${params}`,
      {
        method: "POST",
      }
    );
  }

  /**
   * #86 - Get Tournament Participants
   * GET /api/tournaments/{tournamentId}/participants
   */
  static async getTournamentParticipants(
    tournamentId: number
  ): Promise<TournamentParticipation[]> {
    return await apiFetch<TournamentParticipation[]>(
      `/tournaments/${tournamentId}/participants`
    );
  }

  /**
   * #87 - Get Specific Participation Details
   * GET /api/tournaments/{tournamentId}/participants/{participantId}
   */
  static async getParticipationDetails(
    tournamentId: number,
    participantId: number
  ): Promise<TournamentParticipation> {
    return await apiFetch<TournamentParticipation>(
      `/tournaments/${tournamentId}/participants/${participantId}`
    );
  }

  // ===== HELPER METHODS =====

  /**
   * Search tournaments with text query
   */
  static async searchTournaments(
    query: string,
    filters: Omit<TournamentFilters, "search"> = {}
  ): Promise<TournamentsListResponse> {
    return this.listTournaments({ ...filters, search: query });
  }

  /**
   * Get trending tournaments (most viewed/active)
   */
  static async getTrendingTournaments(
    limit: number = 10
  ): Promise<Tournament[]> {
    const response = await this.listTournaments({
      sortBy: "participants-most",
      size: limit,
    });

    return response.tournaments;
  }

  /**
   * Get upcoming tournaments
   */
  static async getUpcomingTournaments(
    limit: number = 10
  ): Promise<Tournament[]> {
    const response = await this.listTournaments({
      sortBy: "date-soonest",
      size: limit,
    });

    return response.tournaments.filter((tournament) => {
      const startDate = new Date(tournament.startDate);
      return startDate > new Date();
    });
  }

  /**
   * Check if user is registered for tournament
   */
  static async isUserRegistered(
    tournamentId: number,
    userId: number
  ): Promise<boolean> {
    try {
      const participation = await this.getParticipationDetails(
        tournamentId,
        userId
      );
      return (
        participation.status === "REGISTERED" ||
        participation.status === "CHECKED_IN"
      );
    } catch {
      return false;
    }
  }
}

export default TournamentService;
