import { useEffect } from "react";
import usePreferences from "../hooks/usePreferences";

// Applies saved preferences (theme/lang) on app mount. Renders nothing.
export default function PreferencesBootstrap() {
  const { applyTheme, theme } = usePreferences();

  useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme, applyTheme]);

  return null;
}
