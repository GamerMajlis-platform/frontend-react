export type TournamentCategory = "upcoming" | "ongoing" | "past";

export interface Tournament {
  id: number;
  category: TournamentCategory;
  game: string;
  organizer: string;
  startDate: string; // ISO or display string
  prizePool: string; // display string like "$1,000"
  playersJoined: number;
  imageUrl?: string;
}

export const tournaments: Tournament[] = [
  {
    id: 1,
    category: "upcoming",
    game: "Valorant Community Cup",
    organizer: "GM Events",
    startDate: "2025-10-12",
    prizePool: "$1,000",
    playersJoined: 64,
    imageUrl: undefined,
  },
  {
    id: 2,
    category: "ongoing",
    game: "FIFA Weekend League",
    organizer: "Majlis Sports",
    startDate: "2025-09-20",
    prizePool: "$500",
    playersJoined: 128,
    imageUrl: undefined,
  },
  {
    id: 3,
    category: "past",
    game: "CS2 5v5 Night Bash",
    organizer: "Night Owls",
    startDate: "2025-08-10",
    prizePool: "$2,500",
    playersJoined: 80,
    imageUrl: undefined,
  },
  {
    id: 4,
    category: "upcoming",
    game: "Apex Legends Showdown",
    organizer: "GM Events",
    startDate: "2025-11-05",
    prizePool: "$1,500",
    playersJoined: 100,
    imageUrl: undefined,
  },
  {
    id: 5,
    category: "ongoing",
    game: "Rocket League Rumble",
    organizer: "Night Owls",
    startDate: "2025-09-15",
    prizePool: "$3,000",
    playersJoined: 120,
    imageUrl: undefined,
  },
  {
    id: 6,
    category: "past",
    game: "CS2 5v5 Night Bash",
    organizer: "Night Owls",
    startDate: "2025-08-10",
    prizePool: "$2,500",
    playersJoined: 80,
    imageUrl: undefined,
  },
  {
    id: 7,
    category: "upcoming",
    game: "Street Fighter Showmatch",
    organizer: "Retro League",
    startDate: "2025-10-03",
    prizePool: "$750",
    playersJoined: 32,
    imageUrl: undefined,
  },
  {
    id: 8,
    category: "upcoming",
    game: "Co-op Speedrun Rally",
    organizer: "Speedrun Guild",
    startDate: "2025-11-20",
    prizePool: "$300",
    playersJoined: 48,
    imageUrl: undefined,
  },
  {
    id: 9,
    category: "ongoing",
    game: "F1 Championship Qualifier",
    organizer: "Majlis Esports",
    startDate: "2025-09-10",
    prizePool: "$2,000",
    playersJoined: 24,
    imageUrl: undefined,
  },
  {
    id: 10,
    category: "past",
    game: "Clash Royale Weekend",
    organizer: "Mobile Masters",
    startDate: "2025-07-18",
    prizePool: "$400",
    playersJoined: 200,
    imageUrl: undefined,
  },
  {
    id: 11,
    category: "upcoming",
    game: "Apex Legends Invitational",
    organizer: "Majlis Sports",
    startDate: "2025-12-01",
    prizePool: "$5,000",
    playersJoined: 160,
    imageUrl: undefined,
  },
  {
    id: 12,
    category: "ongoing",
    game: "Rocket League Cup",
    organizer: "Night Owls",
    startDate: "2025-09-14",
    prizePool: "$1,200",
    playersJoined: 96,
    imageUrl: undefined,
  },
  {
    id: 13,
    category: "past",
    game: "Mortal Kombat Throwdown",
    organizer: "Retro League",
    startDate: "2025-06-05",
    prizePool: "$600",
    playersJoined: 40,
    imageUrl: undefined,
  },
  {
    id: 14,
    category: "upcoming",
    game: "Fortnite Creative Jam",
    organizer: "GM Events",
    startDate: "2025-10-28",
    prizePool: "$900",
    playersJoined: 300,
    imageUrl: undefined,
  },
  {
    id: 15,
    category: "ongoing",
    game: "Street Fighter Ladder",
    organizer: "Retro League",
    startDate: "2025-09-05",
    prizePool: "$1,100",
    playersJoined: 56,
    imageUrl: undefined,
  },
];

// Sort options specific to tournaments
export const tournamentSortOptions = [
  { value: "date-soonest" as const, labelKey: "tournaments.sort.options.date-soonest" },
  { value: "date-latest" as const, labelKey: "tournaments.sort.options.date-latest" },
  { value: "prize-high" as const, labelKey: "tournaments.sort.options.prize-high" },
  { value: "prize-low" as const, labelKey: "tournaments.sort.options.prize-low" },
  { value: "players-high" as const, labelKey: "tournaments.sort.options.players-high" },
  { value: "players-low" as const, labelKey: "tournaments.sort.options.players-low" },
  { value: "game" as const, labelKey: "tournaments.sort.options.game" },
];

export type TournamentSortOption =
  (typeof tournamentSortOptions)[number]["value"];
