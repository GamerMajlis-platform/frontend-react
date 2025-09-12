import { useTranslation } from "react-i18next";
import { languages } from "../data";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dark" | "light";
}

export default function LanguageSwitcher({
  className = "",
  variant = "dark",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
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
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
