import { memo } from "react";
import { useTranslation } from "react-i18next";

type TabKey = "about" | "preferences" | "stats";

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}
/**
 * Design note:
 * - Wrapped with React.memo: props are primitives, so shallow compare is cheap and effective.
 * - Single `props` param for consistent style.
 */
function TabBar(props: TabBarProps) {
  const { active, onChange } = props;
  const { t } = useTranslation();

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => onChange(id)}
        className={`relative px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
          isActive
            ? "bg-gradient-to-r from-primary to-cyan-300 text-slate-900 shadow-glow"
            : "bg-slate-700/50 text-slate-300 hover:text-white backdrop-blur-sm"
        }`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-300 rounded-full animate-pulse opacity-20" />
        )}
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
      <TabButton id="about" label={t("profile.tabs.about")} />
      <TabButton id="preferences" label={t("profile.tabs.preferences")} />
      <TabButton id="stats" label={t("profile.tabs.stats")} />
    </div>
  );
}

export default memo(TabBar);
