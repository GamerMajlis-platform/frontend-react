// Centralized type definitions for the GamerMajlis application
export * from "./ui";
export * from "./auth";
export * from "./forms";
export * from "./common";
export * from "./events";
export * from "./tournaments";

// Re-export legacy data types (will be replaced gradually)
export type {
  Product as LegacyProduct,
  WishlistItem,
  TournamentCategory,
  Tournament,
  EventCategory,
  EventItem,
  NavigationItem,
  Language,
  Message,
  Conversation,
  UserProfile,
  UserStats,
  Achievement,
  SortOption,
  ProductSortOption,
  TournamentSortOption,
  EventSortOption,
} from "./data";

// Export new backend-integrated product types
export * from "./products";

// Export event types
export * from "./events";
