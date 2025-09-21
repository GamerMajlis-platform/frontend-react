import { useEffect, useCallback } from "react";
import { useAppContext } from "../context/useAppContext";
import i18n from "../i18n/config";

/**
 * Hook to synchronize user preferences (language) between context,
 * i18n, and the document. Persistence is handled by AppContext via localStorage.
 */
export function usePreferences() {
  const { settings, updateSetting } = useAppContext();

  const setLanguage = useCallback(
    (lng: string) => {
      if (lng && i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng);
      }
      updateSetting("preferences", "language", lng);
    },
    [updateSetting]
  );

  // Apply current settings on mount and whenever they change
  useEffect(() => {
    if (settings?.preferences?.language) {
      const lng = settings.preferences.language;
      if (i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng);
      }
    }
  }, [settings?.preferences?.language]);

  return {
    language: settings.preferences.language,
    setLanguage,
    settings,
    updateSetting,
  } as const;
}

export default usePreferences;
