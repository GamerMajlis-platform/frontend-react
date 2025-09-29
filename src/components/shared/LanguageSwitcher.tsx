import { useTranslation } from "react-i18next";
import { languages } from "../../data";
import type { Language } from "../../data";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dark" | "light";
}

export default function LanguageSwitcher({
  className = "",
  variant = "dark",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const changeLanguage = async (langCode: string) => {
    try {
      // Preload resources for the target language first to avoid long
      // suspense waits or requiring a full page reload to see new keys.
      // `loadLanguages` is not strongly typed in some i18next versions,
      // so access it via `any` to avoid TS errors.
      // This fetches backend resources for the language before switching.
      // Some i18next builds expose `loadLanguages`; check and call safely.
      const maybeLoad = i18n as unknown as {
        loadLanguages?: (...args: unknown[]) => Promise<void>;
      };
      if (typeof maybeLoad.loadLanguages === "function") {
        await maybeLoad.loadLanguages(langCode);
      }

      // Now change language; resources are already loaded so components
      // will re-render immediately without long Suspense waits.
      await i18n.changeLanguage(langCode);

      // Ensure all configured namespaces are present (defensive).
      const namespaces = (i18n.options.ns as string[]) || ["translation"];
      await i18n.loadNamespaces(namespaces);
    } catch (error) {
      console.error("Failed to change language:", error);
      // Fallback to simple language change
      i18n.changeLanguage(langCode).catch(() => {});
    }
  };

  const baseLight =
    "bg-white/80 text-slate-800 border border-slate-300 rounded-full px-3 py-1.5 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-400 focus:border-transparent appearance-none cursor-pointer shadow-xs hover:bg-white transition-colors min-w-[120px]";
  const baseDark =
    "bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 text-base font-medium focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer shadow-xs hover:bg-slate-600 transition-colors min-w-[120px]";

  return (
    <div className={`relative ${className}`}>
      <select
        value={i18n.resolvedLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className={variant === "light" ? baseLight : baseDark}
        aria-label="Select language"
      >
        {languages.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
