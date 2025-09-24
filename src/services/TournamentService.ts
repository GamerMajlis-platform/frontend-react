// Tournament Management Service
// Implements all Tournament Management APIs (#74-#87)

import { apiFetch } from "../lib/api";
import type {
  Tournament,
  TournamentMatch,
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

  // ===== TOURNAMENT BRACKET GENERATION (T16) =====

  /**
   * T16: Generate tournament brackets automatically
   */
  static generateBracket(
    participants: TournamentParticipation[],
    tournamentType: string
  ) {
    switch (tournamentType) {
      case "ELIMINATION":
        return this.generateEliminationBracket(participants);
      case "ROUND_ROBIN":
        return this.generateRoundRobinSchedule(participants);
      case "SWISS":
        return this.generateSwissSchedule(participants);
      case "BRACKET":
        return this.generateStandardBracket(participants);
      default:
        throw new Error(`Unsupported tournament type: ${tournamentType}`);
    }
  }

  /**
   * Generate single/double elimination bracket
   */
  private static generateEliminationBracket(
    participants: TournamentParticipation[]
  ) {
    const participantCount = participants.length;
    const rounds = Math.ceil(Math.log2(participantCount));
    const bracket: TournamentMatch[][] = [];

    // Seed participants (1 vs lowest, 2 vs second lowest, etc.)
    const seededParticipants = this.seedParticipants(participants);

    // Create first round matches
    const firstRound: TournamentMatch[] = [];
    for (let i = 0; i < seededParticipants.length; i += 2) {
      if (seededParticipants[i + 1]) {
        firstRound.push({
          matchId: `R1-M${Math.floor(i / 2) + 1}`,
          round: 1,
          participant1: seededParticipants[i],
          participant2: seededParticipants[i + 1],
          winner: null,
          status: "PENDING",
        });
      } else {
        // Bye for odd number of participants
        firstRound.push({
          matchId: `R1-M${Math.floor(i / 2) + 1}`,
          round: 1,
          participant1: seededParticipants[i],
          participant2: null,
          winner: seededParticipants[i],
          status: "COMPLETED" as const, // Bye means completed with automatic winner
        });
      }
    }

    bracket.push(firstRound);

    // Generate subsequent rounds
    for (let round = 2; round <= rounds; round++) {
      const previousRound: TournamentMatch[] = bracket[round - 2];
      const currentRound: TournamentMatch[] = [];

      for (let i = 0; i < previousRound.length; i += 2) {
        if (previousRound[i + 1]) {
          currentRound.push({
            matchId: `R${round}-M${Math.floor(i / 2) + 1}`,
            round,
            participant1: null, // Will be filled by winners
            participant2: null,
            winner: null,
            status: "PENDING" as const,
            // dependsOn can be tracked separately or in match management
          });
        }
      }

      if (currentRound.length > 0) {
        bracket.push(currentRound);
      }
    }

    return {
      type: "ELIMINATION",
      rounds: rounds,
      bracket,
      totalMatches: bracket.reduce((sum, round) => sum + round.length, 0),
    };
  }

  /**
   * Generate round robin schedule
   */
  private static generateRoundRobinSchedule(
    participants: TournamentParticipation[]
  ) {
    const schedule = [];
    const n = participants.length;

    // Each participant plays every other participant once
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        schedule.push({
          matchId: `RR-${i + 1}v${j + 1}`,
          round: Math.floor(schedule.length / (n / 2)) + 1,
          participant1: participants[i],
          participant2: participants[j],
          winner: null,
          status: "PENDING",
        });
      }
    }

    return {
      type: "ROUND_ROBIN",
      totalRounds: n - 1,
      schedule,
      totalMatches: schedule.length,
    };
  }

  /**
   * Generate Swiss system schedule
   */
  private static generateSwissSchedule(
    participants: TournamentParticipation[]
  ) {
    const rounds = Math.ceil(Math.log2(participants.length));
    const schedule = [];

    // First round: random pairing
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        schedule.push({
          matchId: `SW-R1-${Math.floor(i / 2) + 1}`,
          round: 1,
          participant1: shuffled[i],
          participant2: shuffled[i + 1],
          winner: null,
          status: "PENDING",
        });
      }
    }

    return {
      type: "SWISS",
      totalRounds: rounds,
      currentRound: 1,
      schedule,
      note: "Subsequent rounds will be generated based on scores",
    };
  }

  /**
   * Generate standard bracket (similar to elimination but with specific seeding)
   */
  private static generateStandardBracket(
    participants: TournamentParticipation[]
  ) {
    return this.generateEliminationBracket(participants);
  }

  /**
   * Seed participants for bracket (1 vs lowest ranked, 2 vs second lowest, etc.)
   */
  private static seedParticipants(participants: TournamentParticipation[]) {
    // Sort by registration time or ranking (if available)
    const sorted = participants.sort((a, b) => {
      // Primary sort: wins (descending)
      if (a.wins !== b.wins) return b.wins - a.wins;
      // Secondary sort: registration time (ascending)
      return (
        new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
      );
    });

    return sorted;
  }

  /**
   * F8: Check if tournament can be modified (before start)
   */
  static canModifyTournament(tournament: Tournament): boolean {
    const now = new Date();
    const startDate = new Date(tournament.startDate);

    return (
      startDate > now &&
      tournament.status !== "IN_PROGRESS" &&
      tournament.status !== "COMPLETED"
    );
  }

  /**
   * F9: Check if participant can withdraw (before tournament starts)
   */
  static canWithdrawFromTournament(tournament: Tournament): boolean {
    const now = new Date();
    const startDate = new Date(tournament.startDate);

    return (
      startDate > now &&
      tournament.status !== "IN_PROGRESS" &&
      tournament.status !== "COMPLETED"
    );
  }
}

export default TournamentService;
