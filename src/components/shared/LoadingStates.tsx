interface LoadingStateProps {
  className?: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  type?: "default" | "card" | "list" | "skeleton";
}

/**
 * Consolidated loading state component to eliminate duplication
 * Replaces multiple similar loading components throughout the app
 */
export function LoadingState({
  className = "",
  count = 3,
  size = "md",
  type = "default",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  if (type === "skeleton") {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center space-x-3 p-3"
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`animate-pulse space-y-4 p-4 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}
        ></div>
        <span className="text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingState;
