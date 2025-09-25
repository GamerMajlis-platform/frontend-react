import { memo, useRef, useEffect, useState } from "react";
import formatBio from "../../utils/formatMarkdown";
import { useTranslation } from "react-i18next";

interface AboutSectionProps {
  isRTL: boolean;
  bio: string;
  isSaving?: boolean;
  onSave?: (bio: string) => void;
  onCancel?: () => void;
}

/**
 * Design note:
 * - Wrapped with React.memo since props are primitives/strings; reduces re-renders when tabs switch.
 * - Single `props` parameter for consistent `props.xxx` access pattern.
 */
function AboutSection(props: AboutSectionProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localBio, setLocalBio] = useState(props.bio || "");
  const bioRef = useRef<HTMLTextAreaElement | null>(null);

  const autoSizeBio = () => {
    const el = bioRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // use shared formatBio util

  useEffect(() => {
    // sync local bio when parent prop changes while not editing
    if (!isEditing) setLocalBio(props.bio || "");
    autoSizeBio();
  }, [props.bio, isEditing]);

  const wrapSelection = (before: string, after: string = before) => {
    const el = bioRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value;
    const selected = value.slice(start, end);
    const newValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    setLocalBio(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
      autoSizeBio();
    });
  };

  if (!isEditing) {
    return (
      <div className="flex items-start justify-between">
        <div
          className={`text-base sm:text-lg leading-relaxed ${
            props.bio ? "text-slate-200" : "text-slate-500 italic"
          } max-w-[80%]`}
          // render lightweight markdown: **bold** and *italic*
          dangerouslySetInnerHTML={{
            __html: formatBio(
              props.bio ||
                (t("profile:placeholders.bio") as string) ||
                "Tell others about yourself..."
            ),
          }}
        />
        <div className="ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            {t("common.edit")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
        {t("profile:tabs.about")}
      </h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => wrapSelection("**")}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-sm transition-colors"
          >
            B
          </button>
          <button
            onClick={() => wrapSelection("*")}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-white italic text-sm transition-colors"
          >
            I
          </button>
        </div>
        <textarea
          ref={bioRef}
          value={localBio}
          onChange={(e) => {
            setLocalBio(e.target.value);
            autoSizeBio();
          }}
          placeholder={
            (t("profile:placeholders.bio") as string) ||
            "Tell others about yourself..."
          }
          className={`w-full min-h-[120px] bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all duration-300 ${
            props.isRTL ? "text-right" : ""
          }`}
        />
        <div className="text-right text-slate-400 text-sm">
          {isEditing ? localBio.length : (props.bio || "").length} / 500
        </div>
      </div>
      {/* Save / Cancel controls when editing */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            // cancel local edits
            setLocalBio(props.bio || "");
            setIsEditing(false);
            props.onCancel?.();
          }}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={() => {
            props.onSave?.(localBio);
            setIsEditing(false);
          }}
          disabled={props.isSaving}
          className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {props.isSaving ? t("common.saving") : t("common.save")}
        </button>
      </div>
    </div>
  );
}

export default memo(AboutSection);
