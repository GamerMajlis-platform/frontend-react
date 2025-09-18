import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export type SortOptionItem = {
  value: string;
  labelKey?: string;
  label?: string;
};

type SortByProps = {
  options: SortOptionItem[];
  value: string;
  onChange: (v: string) => void;
  placeholderKey?: string; // translation key for the button placeholder
  className?: string;
};

function SortBy(props: SortByProps) {
  const { options, value, onChange, placeholderKey, className = "" } = props;
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isRTL = i18n.language && i18n.language.startsWith("ar");

  return (
    <div className={`relative w-48 ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border-none bg-cyan-300 px-3 py-3 text-slate-900 transition-colors duration-200 hover:bg-cyan-200 sort-button text-sm font-medium`}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {placeholderKey ? t(placeholderKey) : t("sort.placeholder")}
        </span>
        <span
          className={`ml-1 transform transition-transform duration-300 ease-in-out ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className={`absolute top-full ${
            isRTL ? "right-0" : "right-0"
          } z-50 mt-2 w-48 rounded-xl border border-slate-600 bg-slate-800 p-2 shadow-2xl sort-dropdown backdrop-blur-sm`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`block w-full rounded-md border-none px-3 py-2 text-white transition-colors duration-200 text-sm hover:bg-slate-700 ${
                value === option.value ? "bg-slate-700" : "bg-transparent"
              } ${isRTL ? "text-right pr-3" : "text-left pl-3"}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.labelKey ? t(option.labelKey) : option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(SortBy);
