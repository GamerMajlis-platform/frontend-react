import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type TabKey = "about" | "manage" | "stats";

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
  showManage?: boolean; // if false, hide the manage tab (used when viewing other users)
}
/**
 * Design note:
 * - Wrapped with React.memo: props are primitives, so shallow compare is cheap and effective.
 * - Single `props` param for consistent style.
 */
function TabBar(props: TabBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => {
    const isActive = props.active === id;
    return (
      <button
        onClick={() => props.onChange(id)}
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
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center items-center">
      <TabButton id="about" label={t("profile:tabs.about")} />
      {props.showManage !== false && (
        <TabButton id="manage" label={t("profile:tabs.manage")} />
      )}
      <TabButton id="stats" label={t("profile:tabs.stats")} />

      {/* Settings Icon Button: only show for profile owner (showManage !== false) */}
      {props.showManage !== false && (
        <button
          onClick={() => navigate("/settings")}
          className="relative p-3 rounded-full bg-slate-700/50 hover:bg-primary/20 text-slate-300 hover:text-primary transition-all duration-300 transform hover:scale-105"
          title={t("profile:tabs.settings", "Privacy Settings")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default memo(TabBar);
