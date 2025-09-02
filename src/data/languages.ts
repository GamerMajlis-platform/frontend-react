export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Available languages for the application
export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];
