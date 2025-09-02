export interface NavigationItem {
  name: string;
  key: string;
  translationKey: string;
}

// Navigation items for header
export const navigationItems = [
  { name: "Home", key: "home", translationKey: "nav.home" },
  {
    name: "Tournaments",
    key: "tournaments",
    translationKey: "nav.tournaments",
  },
  {
    name: "Marketplace",
    key: "marketplace",
    translationKey: "nav.marketplace",
  },
  { name: "Events", key: "events", translationKey: "nav.events" },
];
