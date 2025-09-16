// Settings-only row layout
import type { ReactNode } from "react";

export interface SettingRowProps {
  label: string;
  description: string;
  children: ReactNode;
  isLast?: boolean;
}

export default function SettingRow({
  label,
  description,
  children,
  isLast = false,
}: SettingRowProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-6 py-3 md:py-4 items-start md:items-center ${
        !isLast ? "border-b border-slate-500" : ""
      }`}
    >
      <div className="grid gap-1">
        <div className="font-medium text-sm md:text-base text-text">
          {label}
        </div>
        <div className="text-xs md:text-sm leading-relaxed text-text-secondary">
          {description}
        </div>
      </div>
      <div className="justify-self-start md:justify-self-end">{children}</div>
    </div>
  );
}
