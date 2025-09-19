import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { PreferenceItem } from "../../data/profile";

interface PreferencesListProps {
  items: PreferenceItem[];
  isEditing: boolean;
  isRTL: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}
/**
 * Design note:
 * - Wrapped with React.memo to avoid re-rendering when parent state changes unrelated to preferences.
 * - Using a single `props` parameter for clarity and consistency (`props.xxx` reads and skims well).
 * - Default React.memo shallow comparison is sufficient; parents should keep handlers stable with useCallback for best results.
 */
function PreferencesList(props: PreferencesListProps) {
  const { t } = useTranslation();

  if (props.isEditing) {
    return (
      <div className="space-y-4">
        {props.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 group">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            <input
              value={item.text}
              onChange={(e) => props.onUpdate(item.id, e.target.value)}
              placeholder={
                t("profile.placeholders.preferenceItem") ||
                "Add a preference..."
              }
              className={`flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                props.isRTL ? "text-right" : ""
              }`}
            />
            <button
              onClick={() => props.onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              aria-label={t("profile.editing.remove") || "Remove"}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
        <button
          onClick={props.onAdd}
          className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 bg-gradient-to-r from-primary to-cyan-300 text-slate-900"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {t("profile.editing.addPreference")}
        </button>
      </div>
    );
  }

  const nonEmpty = props.items.filter((p) => p.text.trim());
  return (
    <div className="grid gap-3">
      {nonEmpty.length > 0 ? (
        nonEmpty.map((p) => (
          <div key={p.id} className="flex items-center gap-3 text-slate-200">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm sm:text-base">{p.text}</span>
          </div>
        ))
      ) : (
        <div className="text-slate-500 italic text-sm sm:text-base">
          {t("profile.placeholders.preferenceItem")}
        </div>
      )}
    </div>
  );
}

export default memo(PreferencesList);
