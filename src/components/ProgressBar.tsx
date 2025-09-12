interface ProgressBarProps {
  percentage: number;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ProgressBar({
  percentage,
  className = "",
  gradientFrom = "from-primary",
  gradientTo = "to-cyan-300",
}: ProgressBarProps) {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-700 ease-out rounded-full progress-width`}
        data-width={safePercentage}
      />
    </div>
  );
}
