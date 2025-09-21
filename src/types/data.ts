// Data model types - consolidated from data/ folder and context

// Product types
export interface Product {
  id: number;
  category: string;
  productName: string;
  seller: string;
  price: string;
  rate: string;
  reviews: string;
  imageUrl?: string;
}

export interface WishlistItem extends Product {
  addedAt?: string;
}

// Tournament types
export type TournamentCategory = "upcoming" | "ongoing" | "past";

export interface Tournament {
  id: number;
  category: TournamentCategory;
  game: string;
  organizer: string;
  startDate: string;
  prizePool: string;
  playersJoined: number;
  imageUrl?: string;
}

// Event types
export type EventCategory = "upcoming" | "ongoing" | "past";

export interface EventItem {
  id: number;
  category: EventCategory;
  title: string;
  name: string;
  organizer: string;
  scheduledOn: string;
  startDate: string;
  location: string;
  registered: number;
  maxCapacity: number;
  imageUrl?: string;
}

// Navigation types
export interface NavigationItem {
  id: string;
  labelKey: string;
  path: string;
  icon?: string;
}

// Language types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Message types
export interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  updatedAt: string;
  unread?: number;
  avatar?: string;
}

// Profile types
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  stats: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  tournamentsWon: number;
  winRate: number;
  rank: string;
  level: number;
  experience: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// Sort option types
export interface SortOption {
  value: string;
  labelKey?: string;
  label?: string;
}

export type ProductSortOption =
  | "name"
  | "price-low"
  | "price-high"
  | "rating"
  | "reviews";

export type TournamentSortOption =
  | "date-soonest"
  | "date-latest"
  | "prize-high"
  | "prize-low"
  | "players-high"
  | "players-low"
  | "game";

export type EventSortOption =
  | "date-soonest"
  | "date-latest"
  | "capacity-high"
  | "capacity-low"
  | "registered-high"
  | "registered-low"
  | "title";
