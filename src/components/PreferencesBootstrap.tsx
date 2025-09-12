import { useEffect } from "react";
import usePreferences from "../hooks/usePreferences";

// Applies saved preferences (theme/lang) on app mount. Renders nothing.
export default function PreferencesBootstrap() {
  const { applyTheme, theme, language, setLanguage } = usePreferences();

  useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme, applyTheme]);

  // Apply language preference immediately on mount if present
  useEffect(() => {
    if (language) {
      setLanguage(language);
    }
  }, [language, setLanguage]);

  return null;
}
