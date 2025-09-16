// Settings-only toggle switch
export interface ToggleButtonProps {
  value: boolean;
  onClick: () => void;
  isRTL?: boolean;
}

export default function ToggleButton({
  value,
  onClick,
  isRTL,
}: ToggleButtonProps) {
  const toggleClasses = `${
    value ? "bg-primary" : "bg-slate-500"
  } relative w-12 h-6 min-h-0 rounded-xl border-none cursor-pointer flex items-center ${
    isRTL ? "flex-row-reverse" : "flex-row"
  }`;
  const switchClasses = `absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200 ${
    isRTL ? (value ? "left-0.5" : "left-6") : value ? "left-6" : "left-0.5"
  }`;

  return (
    <button
      className={toggleClasses}
      onClick={onClick}
      aria-label={value ? "Disable" : "Enable"}
    >
      <div className={switchClasses} />
    </button>
  );
}
