// Profile data types and defaults
export type PreferenceItem = {
  id: string;
  text: string;
};

export type StatItem = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export type ProfileData = {
  displayName: string;
  discordName: string;
  bio: string;
  preferences: PreferenceItem[];
  stats: StatItem[];
  level: number;
  xp: number;
  nextLevelXp: number;
};

// Utility function for generating random IDs
export const generateId = (): string => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

// Default gaming preferences options
export const defaultPreferences: string[] = [
  "FPS & Battle Royale Games",
  "Competitive Esports",
  "Co-op Campaign Adventures",
  "Strategy & RTS Games",
  "Racing & Sports Games",
  "RPG & Adventure Games",
  "Indie & Casual Games",
  "VR & AR Gaming",
  "Mobile Gaming",
  "Retro & Classic Games",
];

// Available stat colors for progress bars and indicators
export const statColorOptions: string[] = [
  "from-emerald-400 to-emerald-600",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-pink-600",
  "from-orange-400 to-orange-600",
  "from-red-400 to-red-600",
  "from-yellow-400 to-yellow-600",
  "from-green-400 to-green-600",
  "from-indigo-400 to-indigo-600",
  "from-cyan-400 to-cyan-600",
];

// Default initial profile data
export const getInitialProfileData = (): ProfileData => ({
  displayName: "",
  discordName: "",
  bio: "",
  preferences: [
    { id: generateId(), text: defaultPreferences[0] },
    { id: generateId(), text: defaultPreferences[1] },
    { id: generateId(), text: defaultPreferences[2] },
  ],
  stats: [
    {
      id: generateId(),
      name: "Win Rate",
      value: 87,
      color: statColorOptions[0],
    },
    {
      id: generateId(),
      name: "Hours This Week",
      value: 42,
      color: statColorOptions[1],
    },
    {
      id: generateId(),
      name: "Tournament Wins",
      value: 23,
      color: statColorOptions[2],
    },
    {
      id: generateId(),
      name: "Team Synergy",
      value: 94,
      color: statColorOptions[3],
    },
  ],
  level: 5,
  xp: 3240,
  nextLevelXp: 4000,
});

// Common stat suggestions for quick adding
export const commonStatNames: string[] = [
  "Win Rate",
  "Hours This Week",
  "Tournament Wins",
  "Team Synergy",
  "Kill/Death Ratio",
  "Accuracy",
  "Games Played",
  "Rank Points",
  "Weekly Playtime",
  "Achievement Score",
  "Completion Rate",
  "Streak Record",
];
