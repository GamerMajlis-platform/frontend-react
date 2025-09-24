// Tournament Management Types
// Based on API specifications for Tournament Management APIs (#74-#87)

// ===== CONSTANTS =====

export const TournamentType = {
  ELIMINATION: "ELIMINATION",
  ROUND_ROBIN: "ROUND_ROBIN",
  SWISS: "SWISS",
  BRACKET: "BRACKET",
} as const;

export const TournamentStatus = {
  REGISTRATION_OPEN: "REGISTRATION_OPEN",
  REGISTRATION_CLOSED: "REGISTRATION_CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ParticipantStatus = {
  REGISTERED: "REGISTERED",
  CHECKED_IN: "CHECKED_IN",
  DISQUALIFIED: "DISQUALIFIED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export const TournamentCategoryFilter = {
  ALL: "all",
  UPCOMING: "upcoming",
  REGISTRATION_OPEN: "registration_open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const TournamentSortOption = {
  DATE_SOONEST: "date-soonest",
  DATE_LATEST: "date-latest",
  PRIZE_HIGHEST: "prize-highest",
  PRIZE_LOWEST: "prize-lowest",
  PARTICIPANTS_MOST: "participants-most",
  PARTICIPANTS_LEAST: "participants-least",
  CREATED_NEWEST: "created-newest",
  CREATED_OLDEST: "created-oldest",
} as const;

// ===== TYPE DEFINITIONS =====

export type TournamentType =
  (typeof TournamentType)[keyof typeof TournamentType];
export type TournamentStatus =
  (typeof TournamentStatus)[keyof typeof TournamentStatus];
export type ParticipantStatus =
  (typeof ParticipantStatus)[keyof typeof ParticipantStatus];
export type TournamentCategoryFilter =
  (typeof TournamentCategoryFilter)[keyof typeof TournamentCategoryFilter];
export type TournamentSortOption =
  (typeof TournamentSortOption)[keyof typeof TournamentSortOption];

// ===== BASIC INTERFACES =====

export interface TournamentOrganizer {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface TournamentModerator {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface TournamentParticipantUser {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

// ===== MAIN TOURNAMENT INTERFACE =====

export interface Tournament {
  id: number;
  name: string;
  description: string;
  gameTitle: string;
  gameMode: string;
  tournamentType: TournamentType;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  currency: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  registrationDeadline: string; // ISO 8601 format
  rules: string;
  status: TournamentStatus;
  isPublic: boolean;
  requiresApproval?: boolean;
  organizer: TournamentOrganizer;
  moderators?: TournamentModerator[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===== TOURNAMENT PARTICIPATION =====

export interface TournamentMatch {
  matchId: string;
  round: number;
  participant1: TournamentParticipation | null;
  participant2: TournamentParticipation | null;
  winner: TournamentParticipation | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface TournamentParticipation {
  id: number;
  tournament: {
    id: number;
    name: string;
  };
  participant: TournamentParticipantUser;
  status: ParticipantStatus;
  registeredAt: string;
  checkedIn: boolean;
  disqualified: boolean;
  disqualificationReason?: string | null;
  wins: number;
  losses: number;
  currentRound?: number;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateTournamentRequest {
  name: string;
  description: string;
  gameTitle: string;
  gameMode: string;
  tournamentType: TournamentType;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  currency: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  rules: string;
  status: TournamentStatus;
  isPublic: boolean;
  requiresApproval: boolean;
}

export interface UpdateTournamentRequest {
  name?: string;
  description?: string;
  maxParticipants?: number;
  prizePool?: number;
  registrationDeadline?: string;
  startDate?: string;
  endDate?: string;
  rules?: string;
  status?: TournamentStatus;
}

export interface TournamentsListResponse {
  tournaments: Tournament[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ===== FILTERS AND QUERIES =====

export interface TournamentFilters {
  search?: string;
  category?: TournamentCategoryFilter;
  sortBy?: TournamentSortOption;
  gameTitle?: string;
  status?: TournamentStatus;
  prizeMin?: number;
  prizeMax?: number;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  size?: number;
}

// ===== FORM VALIDATION =====

export interface TournamentFormErrors {
  name?: string;
  description?: string;
  gameTitle?: string;
  gameMode?: string;
  tournamentType?: string;
  maxParticipants?: string;
  entryFee?: string;
  prizePool?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  rules?: string;
  isPublic?: string;
  requiresApproval?: string;
  general?: string;
}

// ===== PARTICIPATION ACTIONS =====

export interface RegisterForTournamentResponse {
  id: number;
  tournament: {
    id: number;
    name: string;
  };
  participant: TournamentParticipantUser;
  status: ParticipantStatus;
  registeredAt: string;
  checkedIn: boolean;
  disqualified: boolean;
}

export interface SubmitMatchResultRequest {
  participantId: number;
  won: boolean;
  score?: string;
  notes?: string;
}

export interface DisqualifyParticipantRequest {
  participantId: number;
  reason: string;
}

// ===== UI STATE TYPES =====

export interface TournamentGridProps {
  tournaments: Tournament[];
  loading?: boolean;
  error?: string | null;
  onTournamentClick?: (tournament: Tournament) => void;
  onRegisterToggle?: (tournamentId: number) => void;
  showActions?: boolean;
}

export interface CreateTournamentFormProps {
  onSubmit?: (data: CreateTournamentRequest) => Promise<void>;
  onSuccess?: (tournament: Tournament) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateTournamentRequest>;
}

// ===== ACTIVITY VARIANT MAPPING =====

export type TournamentActivityVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

// Helper function to map tournament status to activity variant
export const getTournamentActivityVariant = (
  status: TournamentStatus
): TournamentActivityVariant => {
  switch (status) {
    case TournamentStatus.REGISTRATION_OPEN:
      return "success";
    case TournamentStatus.REGISTRATION_CLOSED:
      return "warning";
    case TournamentStatus.IN_PROGRESS:
      return "primary";
    case TournamentStatus.COMPLETED:
      return "info";
    case TournamentStatus.CANCELLED:
      return "error";
    default:
      return "secondary";
  }
};

// Helper function to check if registration is available
export const isTournamentRegistrationOpen = (
  tournament: Tournament
): boolean => {
  const now = new Date();
  const deadline = new Date(tournament.registrationDeadline);

  return (
    tournament.status === TournamentStatus.REGISTRATION_OPEN &&
    tournament.currentParticipants < tournament.maxParticipants &&
    now < deadline
  );
};

// Helper function to format prize pool
export const formatPrizePool = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};
