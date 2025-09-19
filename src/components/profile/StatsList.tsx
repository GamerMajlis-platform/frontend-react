import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { StatItem } from "../../data/profile";
import { ProgressBar } from "../../components/ProgressBar";

interface StatsListProps {
  items: StatItem[];
  isEditing: boolean;
  isRTL: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<StatItem>) => void;
}
/**
 * Design note:
 * - Wrapped with React.memo to reduce unnecessary re-renders for static lists.
 * - Single `props` parameter to keep code uniform and easy to scan.
 * - Parents should keep `onAdd/onRemove/onUpdate` stable (useCallback) for best memo effectiveness.
 */
function StatsList(props: StatsListProps) {
  const { t } = useTranslation();

  if (props.isEditing) {
    return (
      <div className="space-y-6">
        {props.items.map((s) => (
          <div
            key={s.id}
            className="space-y-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
          >
            <div className="flex items-center gap-3">
              <input
                value={s.name}
                onChange={(e) => props.onUpdate(s.id, { name: e.target.value })}
                placeholder={
                  t("profile.placeholders.statName") ||
                  "Stat name (e.g. Win Rate)"
                }
                className={`flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 ${
                  props.isRTL ? "text-right" : ""
                }`}
              />
              <button
                onClick={() => props.onRemove(s.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                aria-label={t("profile.editing.remove") || "Remove statistic"}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={s.value}
                onChange={(e) =>
                  props.onUpdate(s.id, { value: Number(e.target.value) })
                }
                className="flex-1 accent-primary"
                aria-label={
                  s.name || (t("profile.placeholders.statName") as string)
                }
              />
              <div className="w-12 sm:w-16 text-right text-white font-bold bg-slate-700 px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-sm sm:text-base">
                {s.value}%
              </div>
            </div>
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
          {t("profile.editing.addStat")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {props.items.length > 0 ? (
        props.items.map((s) => (
          <div key={s.id} className="space-y-2 p-4 bg-slate-700/30 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-sm sm:text-base">
                {s.name}
              </span>
              <span className="text-primary font-bold text-sm sm:text-base">
                {s.value}%
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <ProgressBar
                percentage={s.value}
                className="h-full"
                gradientFrom={s.color.split(" ")[0]}
                gradientTo={s.color.split(" ")[1]}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-slate-500 italic text-sm sm:text-base">
          {t("profile.placeholders.statName")}
        </div>
      )}
    </div>
  );
}

export default memo(StatsList);
