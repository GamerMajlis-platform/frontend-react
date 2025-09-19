interface ProgressBarProps {
  percentage: number;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ProgressBar(props: ProgressBarProps) {
  const safePercentage = Math.min(100, Math.max(0, props.percentage));
  const className = props.className || "";
  const gradientFrom = props.gradientFrom || "from-primary";
  const gradientTo = props.gradientTo || "to-cyan-300";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-700 ease-out rounded-full progress-width`}
        data-width={safePercentage}
      />
    </div>
  );
}
