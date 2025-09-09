export type EventCategory = "upcoming" | "ongoing" | "past";

export interface EventItem {
  id: number;
  category: EventCategory;
  name: string;
  organizer: string;
  scheduledOn: string; // ISO date
  location: string;
  imageUrl?: string;
}

export const events: EventItem[] = [
  {
    id: 1,
    category: "upcoming",
    name: "Community Mixer Night",
    organizer: "GM Events",
    scheduledOn: "2025-09-20",
    location: "Riyadh Arena",
  },
  {
    id: 2,
    category: "ongoing",
    name: "Pro Players Meetup",
    organizer: "Majlis Sports",
    scheduledOn: "2025-09-06",
    location: "Online",
  },
  {
    id: 3,
    category: "past",
    name: "LAN Party Weekend",
    organizer: "Night Owls",
    scheduledOn: "2025-08-10",
    location: "Jeddah Convention Center",
  },
  {
    id: 4,
    category: "upcoming",
    name: "Indie Dev Expo",
    organizer: "Indie Hub",
    scheduledOn: "2025-10-02",
    location: "Al Khobar Hall",
  },
  {
    id: 5,
    category: "upcoming",
    name: "Speedrun Marathon",
    organizer: "Speedrun Guild",
    scheduledOn: "2025-10-15",
    location: "Online",
  },
  {
    id: 6,
    category: "ongoing",
    name: "Local Game Dev Meetup",
    organizer: "GM Events",
    scheduledOn: "2025-09-12",
    location: "Riyadh Library",
  },
  {
    id: 7,
    category: "past",
    name: "Retro Arcade Night",
    organizer: "Retro League",
    scheduledOn: "2025-07-22",
    location: "Old Town Arcade",
  },
  {
    id: 8,
    category: "upcoming",
    name: "Cosplay Contest",
    organizer: "FanCon",
    scheduledOn: "2025-11-05",
    location: "Expo Center",
  },
  {
    id: 9,
    category: "ongoing",
    name: "Community Charity Stream",
    organizer: "Majlis Care",
    scheduledOn: "2025-09-08",
    location: "Online",
  },
  {
    id: 10,
    category: "upcoming",
    name: "Beginner Workshop: Game Design",
    organizer: "Indie Hub",
    scheduledOn: "2025-10-20",
    location: "Digital Studio",
  },
  {
    id: 11,
    category: "past",
    name: "Strategy Nights",
    organizer: "Night Owls",
    scheduledOn: "2025-06-30",
    location: "Majlis Arena",
  },
];

export const eventSortOptions = [
  { value: "date-soonest", labelKey: "events.sort.date-soonest" },
  { value: "date-latest", labelKey: "events.sort.date-latest" },
  { value: "name", labelKey: "sort.name" },
  { value: "organizer", labelKey: "events.sort.organizer" },
  { value: "location", labelKey: "events.sort.location" },
];

export type EventSortOption = (typeof eventSortOptions)[number]["value"];
