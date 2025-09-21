import { useEffect } from "react";
import { usePreferences } from "../hooks";

// Applies saved preferences (language) on app mount. Renders nothing.
export default function PreferencesBootstrap() {
  const { language, setLanguage } = usePreferences();

  // Apply language preference immediately on mount if present
  useEffect(() => {
    if (language) {
      setLanguage(language);
    }
  }, [language, setLanguage]);

  return null;
}
