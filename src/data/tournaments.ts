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
];
