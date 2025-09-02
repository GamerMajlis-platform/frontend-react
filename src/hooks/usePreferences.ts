import { useEffect, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import i18n from "../i18n/config";

/**
 * Hook to synchronize user preferences (language/theme) between context,
 * i18n, and the document. Persistence is handled by AppContext via localStorage.
 */
export function usePreferences() {
  const { settings, updateSetting } = useAppContext();

  const applyTheme = useCallback((theme: "dark" | "light" | "auto") => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const effective =
      theme === "auto" ? (prefersDark ? "dark" : "light") : theme;

    // Toggle a class for Tailwind's dark mode and set a data attribute for custom CSS if needed
    root.classList.toggle("dark", effective === "dark");
    root.setAttribute("data-theme", effective);
  }, []);

  const setLanguage = useCallback(
    (lng: string) => {
      if (lng && i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng);
      }
      updateSetting("preferences", "language", lng);
    },
    [updateSetting]
  );

  const setTheme = useCallback(
    (theme: "dark" | "light" | "auto") => {
      applyTheme(theme);
      updateSetting("preferences", "theme", theme);
    },
    [applyTheme, updateSetting]
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

  useEffect(() => {
    if (settings?.preferences?.theme) {
      applyTheme(settings.preferences.theme);
    }
  }, [settings?.preferences?.theme, applyTheme]);

  return {
    language: settings.preferences.language,
    theme: settings.preferences.theme,
    setLanguage,
    setTheme,
    applyTheme,
    settings,
    updateSetting,
  } as const;
}

export default usePreferences;
