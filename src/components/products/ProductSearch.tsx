import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useDebounce";
import { SortBy } from "../shared";
import type {
  ProductSearchParams,
  ProductListResponse,
  ProductCategoryType,
  ProductCondition,
} from "../../types/products";
import ProductService from "../../services/ProductService";

interface ProductSearchProps {
  onSearchResults?: (results: ProductListResponse) => void;
  onSearchParamsChange?: (params: ProductSearchParams) => void;
  initialQuery?: string;
  showFilters?: boolean;
  autoSearch?: boolean;
}

interface FilterState {
  category?: ProductCategoryType;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: "price" | "createdAt" | "rating" | "views" | "wishlist";
  sortOrder?: "asc" | "desc";
}

const sortOptions = [
  { value: "createdAt-desc", labelKey: "product.sort.newest" },
  { value: "createdAt-asc", labelKey: "product.sort.oldest" },
  { value: "price-asc", labelKey: "product.sort.priceAsc" },
  { value: "price-desc", labelKey: "product.sort.priceDesc" },
  { value: "rating-desc", labelKey: "product.sort.rating" },
  { value: "views-desc", labelKey: "product.sort.popular" },
];

export default function ProductSearch({
  onSearchResults,
  onSearchParamsChange,
  initialQuery = "",
  showFilters = true,
  autoSearch = true,
}: ProductSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortValue, setSortValue] = useState("createdAt-desc");
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ name: string; displayName: string }>
  >([]);

  const debouncedQuery = useDebounce(query, 300);

  // Compute current sort for SortBy component
  const currentSort = sortValue;

  // Handle sort changes from SortBy component
  const handleSortChange = (newSort: string) => {
    setSortValue(newSort);
    const [sortBy, sortOrder] = newSort.split("-");
    handleFilterChange("sortBy", sortBy);
    handleFilterChange("sortOrder", sortOrder);
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await ProductService.getCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: FilterState) => {
      if (!autoSearch) return;

      setIsSearching(true);
      try {
        const params: ProductSearchParams = {
          query: searchQuery.trim() || undefined,
          page: 0,
          size: 20,
          ...searchFilters,
        };

        const results = await ProductService.searchProducts(params);

        if (onSearchResults) {
          onSearchResults(results);
        }

        if (onSearchParamsChange) {
          onSearchParamsChange(params);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [autoSearch, onSearchResults, onSearchParamsChange]
  );

  // Trigger search when query or filters change
  useEffect(() => {
    if (autoSearch) {
      performSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, performSearch, autoSearch]);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleManualSearch = () => {
    performSearch(query, filters);
  };

  const clearFilters = () => {
    setFilters({});
    setQuery("");
  };

  const hasActiveFilters =
    Object.values(filters).some((value) => value !== undefined) || query.trim();

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("product.searchPlaceholder")}
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        )}
        {!autoSearch && (
          <button
            onClick={handleManualSearch}
            disabled={isSearching}
            aria-label={t("product.searchButton")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-500 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t("product.filters")}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {t("product.clearFilters")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.category")}
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                aria-label={t("product.category")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">{t("product.allCategories")}</option>
                {categories?.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.displayName}
                  </option>
                )) || null}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.condition")}
              </label>
              <select
                value={filters.condition || ""}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value)
                }
                aria-label={t("product.condition")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">{t("product.allConditions")}</option>
                <option value="NEW">{t("product.conditions.new")}</option>
                <option value="USED_LIKE_NEW">
                  {t("product.conditions.usedLikeNew")}
                </option>
                <option value="USED_GOOD">
                  {t("product.conditions.usedGood")}
                </option>
                <option value="USED_FAIR">
                  {t("product.conditions.usedFair")}
                </option>
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.brand")}
              </label>
              <input
                type="text"
                value={filters.brand || ""}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                placeholder={t("product.brandPlaceholder")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.minPrice")}
              </label>
              <input
                type="number"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", parseFloat(e.target.value))
                }
                placeholder="0"
                min="0"
                step="0.01"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.maxPrice")}
              </label>
              <input
                type="number"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange("maxPrice", parseFloat(e.target.value))
                }
                placeholder="1000"
                min="0"
                step="0.01"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("product.sortBy")}
              </label>
              <SortBy
                value={currentSort}
                onChange={handleSortChange}
                options={sortOptions}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
