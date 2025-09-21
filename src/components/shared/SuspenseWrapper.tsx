import React, { Suspense } from "react";
import type { ReactNode } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Default loading component
 */
export function DefaultLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Page loading component for full-page loads
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while we load the content.
        </p>
      </div>
    </div>
  );
}

/**
 * Card loading component for content blocks
 */
export function CardLoader({ className = "" }: { className?: string }) {
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

/**
 * Button loading component
 */
export function ButtonLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-transparent border-t-current ${sizeClasses[size]}`}
    />
  );
}

/**
 * List loading component
 */
export function ListLoader({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-3">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Suspense wrapper with customizable fallback
 */
export function SuspenseWrapper({
  children,
  fallback = <DefaultLoader />,
  className,
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className}>{children}</div>
    </Suspense>
  );
}

/**
 * Higher-order component for lazy-loaded components
 */
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback: ReactNode = <DefaultLoader />
) {
  return function SuspenseWrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Multiple suspense boundaries for different loading states
 */
interface MultipleSuspenseProps {
  children: ReactNode;
  fallbacks?: {
    page?: ReactNode;
    content?: ReactNode;
    component?: ReactNode;
  };
  level?: "page" | "content" | "component";
}

export function MultipleSuspense({
  children,
  fallbacks = {},
  level = "component",
}: MultipleSuspenseProps) {
  const getFallback = () => {
    switch (level) {
      case "page":
        return fallbacks.page || <PageLoader />;
      case "content":
        return fallbacks.content || <CardLoader />;
      case "component":
      default:
        return fallbacks.component || <DefaultLoader />;
    }
  };

  return <Suspense fallback={getFallback()}>{children}</Suspense>;
}

export default SuspenseWrapper;
