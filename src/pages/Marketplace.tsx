import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BackgroundDecor,
  SortBy,
  IconSearch,
  ConfirmDialog,
} from "../components";
import { ProductGrid, ProductCreationForm } from "../components/products";
import ProductService from "../services/ProductService";
import type { ParsedProduct } from "../types/products";
import { useIsMobile, useDebounce } from "../hooks";
import { NavigationService } from "../lib/navigation";

export default function Marketplace() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    category?: string;
    condition?: string;
  }>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    product: ParsedProduct | null;
  }>({ open: false, product: null });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Restore scroll position when returning from product details
  useEffect(() => {
    const state = location.state as { scrollY?: number } | null;
    if (state?.scrollY !== undefined) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        window.scrollTo(0, state.scrollY!);
      }, 0);
    }
  }, [location]);

  // Load products from the backend - simple GET request
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts();
      setProducts((response.products as ParsedProduct[]) || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // (search params handled directly via loadProducts when needed)

  // Handle product creation success
  const handleProductCreated = useCallback(async () => {
    setShowCreateForm(false);
    // Reload products list to show the newly created product
    await loadProducts();
  }, [loadProducts]);

  // Product menu handlers
  const handleShareProduct = useCallback((product: ParsedProduct) => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out this ${product.category}: ${product.name}`,
          url: `${window.location.origin}/marketplace/${product.id}`,
        })
        .catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/marketplace/${product.id}`
      );
    }
  }, []);

  const handleEditProduct = useCallback((product: ParsedProduct) => {
    // Navigate to edit page or open edit modal
    NavigationService.navigateTo(`/marketplace/${product.id}/edit`);
  }, []);

  const handleDeleteProduct = useCallback((product: ParsedProduct) => {
    setConfirmDialog({ open: true, product });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDialog.product) return;

    try {
      await ProductService.deleteProduct(confirmDialog.product.id);
      // Immediately remove from UI
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== confirmDialog.product!.id)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setConfirmDialog({ open: false, product: null });
    }
  }, [confirmDialog.product]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDialog({ open: false, product: null });
  }, []);

  const handleSortChange = useCallback((val: string) => {
    setSortBy(val);
  }, []);

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search term
    if (debouncedSearchTerm) {
      const search = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Filter by condition
    if (filters.condition) {
      result = result.filter((p) => p.condition === filters.condition);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [products, debouncedSearchTerm, filters, sortBy]);

  const handleOpenProduct = useCallback(
    (id?: number) => {
      if (!id) return;
      // Capture scroll position and navigate with state
      const scrollY = window.scrollY;
      navigate(`/marketplace/${id}`, {
        state: { from: "marketplace", scrollY },
      });
    },
    [navigate]
  );

  // Backward-compatible event-based navigation from ProductGrid (in case a
  // parent doesn't pass the handler). This keeps the grid usable standalone.
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        // Guarded extraction in case the event is not a CustomEvent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maybe = e as any;
        if (maybe && maybe.detail && maybe.detail.id) {
          handleOpenProduct(maybe.detail.id);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("product:open", handler as EventListener);
    return () =>
      window.removeEventListener("product:open", handler as EventListener);
  }, [handleOpenProduct]);

  // Stable handler to change category filter. It avoids creating a new
  // filters object when the selected category is already active which
  // prevents unnecessary re-renders of children that depend on `filters`.
  const handleCategoryChange = useCallback((category?: string) => {
    setFilters((prev) => {
      if ((prev.category || undefined) === category) return prev;
      return { ...prev, category };
    });
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    []
  );

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <main className="relative z-10 min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1C2541] py-4 sm:py-6 lg:py-8 marketplace-container">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 max-width-container">
        {/* Page Header - Centered */}
        <header className="mb-6 sm:mb-8 flex w-full items-center justify-center py-4 sm:py-6 marketplace-header">
          <h1 className="font-alice text-[32px] sm:text-[40px] lg:text-[56px] leading-tight text-white marketplace-title text-center">
            {t("marketplace.title", "Gaming Marketplace")}
          </h1>
        </header>

        {/* Search and Sort controls */}
        <section className="mb-8 search-section md:mb-6 relative z-10">
          <div
            className={`mb-6 flex w-full max-w-[900px] mx-auto items-center gap-4 search-controls`}
            dir={i18n.dir()}
          >
            {/* + button: will be ordered explicitly per dir */}
            <div
              className={`flex items-center ${
                i18n.dir() === "rtl" ? "order-3" : "order-1"
              }`}
            >
              <button
                onClick={() => setShowCreateForm(true)}
                className="self-center -mt-1 text-white font-extrabold text-4xl hover:opacity-80 transition-opacity px-3 w-12 h-12 flex items-center justify-center"
                type="button"
                aria-label={t("product.createProduct", "Sell Product")}
                title={t("product.createProduct", "Sell Product")}
              >
                +
              </button>
            </div>

            {/* Search Input: center */}
            <div className={`flex-1 ${"order-2"}`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    isMobile
                      ? t("common.search")
                      : t("marketplace.searchPlaceholder", "Search products...")
                  }
                  className={`h-12 w-full rounded-xl border border-slate-600 bg-[#1C2541] px-4 py-3 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] focus:outline-none search-input ${
                    i18n.dir() === "rtl" ? "pl-12" : "pr-12"
                  }`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${
                    i18n.dir() === "rtl" ? "left-3" : "right-3"
                  }`}
                >
                  <IconSearch />
                </div>
              </div>
            </div>

            {/* Desktop: Filter + Sort (swapped order) */}
            <div
              className={`relative hidden sm:flex items-center gap-2 ${
                i18n.dir() === "rtl" ? "order-1" : "order-3"
              }`}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  showFilters || filters.category
                    ? "bg-cyan-500 border-cyan-500 text-black"
                    : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
                }`}
                aria-label={t("product.filters.title", "Filters")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {filters.category && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="w-[180px]">
                <SortBy
                  value={sortBy}
                  onChange={handleSortChange}
                  options={[
                    { value: "name-asc", label: t("sort.nameAsc", "Name A-Z") },
                    {
                      value: "name-desc",
                      label: t("sort.nameDesc", "Name Z-A"),
                    },
                    {
                      value: "price-low",
                      label: t("sort.price_low", "Price: Low to High"),
                    },
                    {
                      value: "price-high",
                      label: t("sort.price_high", "Price: High to Low"),
                    },
                    {
                      value: "newest",
                      label: t("sort.newest", "Newest First"),
                    },
                  ]}
                  placeholderKey="sort.placeholder"
                />
              </div>
            </div>

            {/* Mobile: Combined Sort & Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`sm:hidden flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${
                showFilters || filters.category
                  ? "bg-cyan-500 border-cyan-500 text-black"
                  : "bg-[#1C2541] border-slate-600 text-white"
              } ${i18n.dir() === "rtl" ? "order-1" : "order-3"}`}
              aria-label={t("product.filters.title", "Filters")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {filters.category && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </section>

        {/* Create Product Form */}
        {showCreateForm && (
          <ProductCreationForm
            onCreated={handleProductCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Filter Modal/Bottom Sheet */}
        {showFilters && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />

            {/* Desktop: Modal, Mobile: Bottom Sheet */}
            <div
              className={`fixed z-50 ${
                isMobile
                  ? "bottom-0 left-0 right-0 rounded-t-3xl"
                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl w-full max-w-4xl"
              } bg-[#1C2541] border border-slate-600 p-6 shadow-2xl animate-slide-up`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {t("product.filters.title", "Filters & Sort")}
                </h3>
                <button
                  onClick={() => {
                    setFilters({});
                    setShowFilters(false);
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {t("common.clearFilters", "Clear all")}
                </button>
              </div>

              {/* Sort Section (Mobile) */}
              {isMobile && (
                <div className="mb-6 pb-6 border-b border-slate-600">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("sort.sortBy", "Sort By")}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-300 transition-colors"
                    aria-label={t("sort.sortBy", "Sort By")}
                  >
                    <option value="name-asc">
                      {t("sort.nameAsc", "Name A-Z")}
                    </option>
                    <option value="name-desc">
                      {t("sort.nameDesc", "Name Z-A")}
                    </option>
                    <option value="price-low">
                      {t("sort.price_low", "Price: Low to High")}
                    </option>
                    <option value="price-high">
                      {t("sort.price_high", "Price: High to Low")}
                    </option>
                    <option value="newest">
                      {t("sort.newest", "Newest First")}
                    </option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("product.category", "Category")}
                  </label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-300 transition-colors"
                    aria-label={t("product.category", "Category")}
                  >
                    <option value="">
                      {t("categories.all", "All Categories")}
                    </option>
                    <option value="GAMING_CONSOLES">
                      🎮 {t("categories.gamingConsoles", "Gaming Consoles")}
                    </option>
                    <option value="GAMING_ACCESSORIES">
                      🎯{" "}
                      {t("categories.gamingAccessories", "Gaming Accessories")}
                    </option>
                    <option value="PC_COMPONENTS">
                      💻 {t("categories.pcParts", "PC Components")}
                    </option>
                    <option value="GAMING_PERIPHERALS">
                      ⌨️{" "}
                      {t("categories.gamingPeripherals", "Gaming Peripherals")}
                    </option>
                    <option value="GAMING_CHAIRS">
                      🪑 {t("categories.gamingChairs", "Gaming Chairs")}
                    </option>
                    <option value="HEADSETS">
                      🎧 {t("categories.headsets", "Headsets")}
                    </option>
                    <option value="KEYBOARDS">
                      ⌨️ {t("categories.keyboards", "Keyboards")}
                    </option>
                    <option value="MICE">
                      🖱️ {t("categories.mice", "Mice")}
                    </option>
                    <option value="MONITORS">
                      🖥️ {t("categories.monitors", "Monitors")}
                    </option>
                    <option value="GAMES">
                      🎲 {t("categories.games", "Games")}
                    </option>
                    <option value="COLLECTIBLES">
                      🏆 {t("categories.collectibles", "Collectibles")}
                    </option>
                    <option value="MERCHANDISE">
                      👕 {t("categories.merchandise", "Merchandise")}
                    </option>
                    <option value="OTHER">
                      📦 {t("categories.other", "Other")}
                    </option>
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("product.condition", "Condition")}
                  </label>
                  <select
                    value={filters.condition || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        condition: e.target.value || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-300 transition-colors"
                    aria-label={t("product.condition", "Condition")}
                  >
                    <option value="">
                      {t("product.allConditions", "All Conditions")}
                    </option>
                    <option value="NEW">
                      {t("product.conditions.new", "New")}
                    </option>
                    <option value="LIKE_NEW">
                      {t("product.conditions.likeNew", "Like New")}
                    </option>
                    <option value="EXCELLENT">
                      {t("product.conditions.excellent", "Excellent")}
                    </option>
                    <option value="GOOD">
                      {t("product.conditions.good", "Good")}
                    </option>
                    <option value="FAIR">
                      {t("product.conditions.fair", "Fair")}
                    </option>
                    <option value="POOR">
                      {t("product.conditions.poor", "Poor")}
                    </option>
                    <option value="REFURBISHED">
                      {t("product.conditions.refurbished", "Refurbished")}
                    </option>
                    <option value="FOR_PARTS">
                      {t("product.conditions.forParts", "For Parts")}
                    </option>
                  </select>
                </div>

                {/* Quick Category Pills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("product.quickFilters", "Quick Filters")}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleCategoryChange("GAMING_CONSOLES")}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        filters.category === "GAMING_CONSOLES"
                          ? "bg-cyan-500 text-black"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      🎮 Consoles
                    </button>
                    <button
                      onClick={() => handleCategoryChange("PC_COMPONENTS")}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        filters.category === "PC_COMPONENTS"
                          ? "bg-cyan-500 text-black"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      💻 PC Parts
                    </button>
                    <button
                      onClick={() => handleCategoryChange("GAMES")}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        filters.category === "GAMES"
                          ? "bg-cyan-500 text-black"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      🎲 Games
                    </button>
                  </div>
                </div>
              </div>

              {/* Apply Button (Mobile) */}
              {isMobile && (
                <div className="mt-6 pt-4 border-t border-slate-600">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors"
                  >
                    {t("common.apply", "Apply")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Products Grid */}
        <section className="w-full mt-8 md:mt-6 relative z-0">
          <ProductGrid
            products={filteredAndSortedProducts}
            loading={loading}
            emptyMessage={t("marketplace.noProducts", "No products found")}
            columns={4}
            onProductOpen={handleOpenProduct}
            onShareProduct={handleShareProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </section>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={t("common.confirm", "Confirm")}
        message={t(
          "product.confirmDelete",
          "Are you sure you want to delete this product? This action cannot be undone."
        )}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
}
