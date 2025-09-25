interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Reusable empty state component.
 * - Use for pages and sections when there is no content to display yet.
 * - Accessible and RTL-safe by default (inherits document direction).
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 text-[var(--color-text-secondary)] ${className}`}
    >
      {icon ? (
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--color-dark-secondary)]">
          {typeof icon === "string" ? (
            <img src={icon} alt="" className="w-10 h-10" />
          ) : (
            icon
          )}
        </div>
      ) : null}
      <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      {description ? (
        <p className="text-base mb-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-dark)] transition duration-200 hover:bg-[var(--color-primary-hover)]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
