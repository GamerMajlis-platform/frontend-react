import { useTranslation } from "react-i18next";
import type { ParsedProduct } from "../../types/products";
import { Card } from "../shared";

interface ProductGridProps {
  products: ParsedProduct[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  compact?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export default function ProductGrid({
  products,
  loading = false,
  error = null,
  emptyMessage,
  compact = false,
  columns = 4,
}: ProductGridProps) {
  const { t } = useTranslation();

  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  };

  const gapClasses = compact ? "gap-3" : "gap-4";

  if (loading) {
    return (
      <div className={`grid ${gridClasses[columns]} ${gapClasses}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div
              className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${
                compact ? "h-64" : "h-80"
              }`}
            >
              <div
                className={`bg-gray-300 dark:bg-gray-600 ${
                  compact ? "h-32" : "h-48"
                } rounded-t-lg`}
              />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-red-500 mb-4">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t("product.loadError")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t("product.noProducts")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {emptyMessage || t("product.noProductsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses}`}>
      {(products || []).map((product) => (
        <Card
          key={product.id}
          preset="product"
          id={product.id}
          category={product.category || "Unknown"}
          productName={product.name}
          seller={product.seller?.displayName || "Unknown Seller"}
          price={`$${product.price}`}
          rate={product.averageRating?.toString() || "0"}
          reviews={product.totalReviews?.toString() || "0"}
          imageUrl={product.mainImageUrl}
        />
      ))}
    </div>
  );
}
