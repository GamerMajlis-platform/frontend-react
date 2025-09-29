import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor, SortBy, IconSearch } from "../components";
import { ProductGrid } from "../components/products";
import ProductService from "../services/ProductService";
import type {
  ParsedProduct,
  ProductSearchParams,
  ProductCategoryType,
  ProductCondition,
} from "../types/products";
import { useIsMobile, useDebounce } from "../hooks";
import { NavigationService } from "../lib/navigation";

// Enhanced CreateProductForm Component
function CreateProductForm({
  onCreated,
  onCancel,
}: {
  // onCreated now receives the created product (fetched by id) as a temporary
  // workaround for a backend bug where the products list endpoint doesn't
  // immediately include newly created items. The frontend will fetch the
  // product by id and pass it to the parent so it can be inserted into the
  // visible list without waiting for the backend list fix.
  onCreated?: (created?: ParsedProduct) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    category: ProductCategoryType;
    condition: ProductCondition;
  }>({
    name: "",
    description: "",
    price: "",
    category: "GAMES",
    condition: "NEW",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("product.nameRequired", "Product name is required");
    }

    // T18: Product description must be 10-1000 characters
    if (!formData.description.trim()) {
      newErrors.description = t(
        "product.descriptionRequired",
        "Description is required"
      );
    } else if (formData.description.length < 10) {
      newErrors.description = t(
        "product.descriptionMinLength",
        "Description must be at least 10 characters"
      );
    } else if (formData.description.length > 1000) {
      newErrors.description = t(
        "product.descriptionMaxLength",
        "Description must not exceed 1000 characters"
      );
    }

    // T17: Product price must be positive number
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t(
        "product.validPriceRequired",
        "Valid price is required"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
      };

      const createdProduct = await ProductService.createProduct(payload);

      // Try to fetch the newly created product by id. This is a temporary
      // workaround: the GET /api/products (list) endpoint currently does not
      // reliably return the newly created item immediately after creation.
      // Fetching by id ensures we have the canonical product object to insert
      // into the UI list until the backend team fixes the list behavior.
      let fetchedProduct: ParsedProduct | undefined = undefined;
      try {
        if (createdProduct && createdProduct.id) {
          fetchedProduct = await ProductService.getProduct(createdProduct.id);
        }
      } catch (errFetch) {
        // If the fetch by id fails for any reason, fall back to the created
        // product object returned by createProduct and log a warning.
        console.warn(
          "Failed to fetch product by id after creation, using created response:",
          errFetch
        );
        fetchedProduct = createdProduct;
      }

      if (file && createdProduct.id) {
        try {
          await ProductService.uploadProductImages(
            createdProduct.id,
            [file],
            true
          );
        } catch (imageError) {
          console.error("Failed to upload product image:", imageError);
        }
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "GAMES",
        condition: "NEW",
      });
      setFile(null);
      setErrors({});

      if (onCreated) await onCreated(fetchedProduct);
    } catch (err) {
      console.error("Failed to create product:", err);
      setErrors({
        general: t("product.createError", "Failed to create product"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1C2541] border border-slate-600 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {t("product.createProduct", "Create New Product")}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("product.name", "Product Name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full px-4 py-3 bg-[#0F172A] border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] transition-all duration-300 ${
                errors.name ? "border-red-500" : "border-slate-600"
              }`}
              placeholder={t("product.namePlaceholder", "Enter product name")}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("product.price", "Price")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              className={`w-full px-4 py-3 bg-[#0F172A] border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] transition-all duration-300 ${
                errors.price ? "border-red-500" : "border-slate-600"
              }`}
              placeholder={t("product.pricePlaceholder", "0.00")}
            />
            {errors.price && (
              <p className="mt-2 text-sm text-red-400">{errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {t("product.description", "Description")}
            <span className="text-xs text-gray-500 ml-2">
              ({formData.description.length}/1000 characters)
            </span>
          </label>
          <textarea
            id="product-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className={`w-full px-4 py-3 bg-[#0F172A] border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] transition-all duration-300 ${
              errors.description ? "border-red-500" : "border-slate-600"
            }`}
            placeholder={t(
              "product.descriptionPlaceholder",
              "Describe your product (10-1000 characters)"
            )}
            required
            aria-required="true"
            rows={4}
            maxLength={1000}
            minLength={10}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-400">{errors.description}</p>
          )}
          {formData.description.length > 0 &&
            formData.description.length < 10 && (
              <p className="mt-1 text-xs text-yellow-400">
                {10 - formData.description.length} more characters required
              </p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="product-category"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t("product.category", "Category")}
            </label>
            <select
              id="product-category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ProductCategoryType,
                }))
              }
              className="w-full px-4 py-3 bg-[#0F172A] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] transition-all duration-300"
              required
              aria-required="true"
            >
              <option value="GAMES">{t("categories.games", "Games")}</option>
              <option value="ACCESSORIES">
                {t("categories.accessories", "Accessories")}
              </option>
              <option value="HARDWARE">
                {t("categories.hardware", "Hardware")}
              </option>
              <option value="SOFTWARE">
                {t("categories.software", "Software")}
              </option>
              <option value="MERCHANDISE">
                {t("categories.merchandise", "Merchandise")}
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="product-condition"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t("product.condition", "Condition")}
            </label>
            <select
              id="product-condition"
              value={formData.condition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  condition: e.target.value as ProductCondition,
                }))
              }
              className="w-full px-4 py-3 bg-[#0F172A] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] transition-all duration-300"
              required
              aria-required="true"
            >
              <option value="NEW">{t("product.conditions.new", "New")}</option>
              <option value="USED_LIKE_NEW">
                {t("product.conditions.likeNew", "Like New")}
              </option>
              <option value="USED_GOOD">
                {t("product.conditions.good", "Good")}
              </option>
              <option value="USED_FAIR">
                {t("product.conditions.fair", "Fair")}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="product-image"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {t("product.image", "Product Image")}
            <span className="text-xs text-gray-500 ml-2">
              {" "}
              ({t("common.optional")})
            </span>
          </label>
          <input
            id="product-image"
            name="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-[#0F172A] border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-cyan-500 file:text-white file:rounded-lg hover:file:bg-cyan-600 transition-colors"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            {loading
              ? t("product.creating", "Creating...")
              : t("product.create", "Create Product")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function Marketplace() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    category?: string;
    condition?: string;
  }>({});
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load products from the backend
  const loadProducts = useCallback(
    async (searchParams: ProductSearchParams = {}) => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts({
          page: 0,
          size: 50,
          ...searchParams,
        });
        setProducts((response.products as ParsedProduct[]) || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // (search params handled directly via loadProducts when needed)

  // Handle product creation success
  // Accepts an optional created product object fetched by id. This lets the
  // frontend insert the new product into the current list immediately because
  // the products list endpoint may not include the newly created item yet.
  const handleProductCreated = useCallback(
    async (created?: ParsedProduct) => {
      if (created) {
        // Insert the created product at the top of the list if not already
        // present. This avoids a full reload and hides the backend timing bug
        // from users until the API is fixed.
        setProducts((prev) => {
          const exists = prev.some((p) => p.id === created.id);
          if (exists) return prev;
          return [created, ...prev];
        });
      } else {
        // Fallback: reload list
        await loadProducts();
      }
      setShowCreateForm(false);
    },
    [loadProducts]
  );

  const parseSortParams = useCallback((value: string) => {
    // Map frontend sort keys to API sortBy/sortOrder
    switch (value) {
      case "name-asc":
        return { sortBy: "createdAt", sortOrder: "asc" };
      case "name-desc":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "price-low":
        return { sortBy: "price", sortOrder: "asc" };
      case "price-high":
        return { sortBy: "price", sortOrder: "desc" };
      case "newest":
        return { sortBy: "createdAt", sortOrder: "desc" };
      default:
        return {} as Record<string, string>;
    }
  }, []);

  const debouncedSortBy = useDebounce(sortBy, 250);
  const sortParams = useMemo(
    () => parseSortParams(debouncedSortBy),
    [debouncedSortBy, parseSortParams]
  );

  const handleSortChange = useCallback((val: string) => {
    setSortBy(val);
  }, []);

  const handleOpenProduct = useCallback((id?: number) => {
    if (!id) return;
    // Navigate to product details. Use NavigationService to keep routing centralized.
    NavigationService.navigateTo(`/marketplace/${id}`);
  }, []);

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

  // Load products when search term, sort or filters change
  useEffect(() => {
    const paramsMutable: Record<string, unknown> = {};
    if (debouncedSearchTerm) paramsMutable.query = debouncedSearchTerm;
    if (filters.category)
      paramsMutable.category = filters.category as
        | import("../types/products").ProductCategoryType
        | undefined;
    if (filters.condition)
      paramsMutable.condition = filters.condition as
        | import("../types/products").ProductCondition
        | undefined;
    if (sortParams.sortBy) paramsMutable.sortBy = sortParams.sortBy;
    if (sortParams.sortOrder) paramsMutable.sortOrder = sortParams.sortOrder;

    loadProducts(
      paramsMutable as import("../types/products").ProductSearchParams
    );
  }, [loadProducts, debouncedSearchTerm, sortParams, filters]);

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
            className={`mb-6 flex w-full max-w-[900px] mx-auto items-center gap-3 search-controls`}
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
                  className={`h-12 w-full rounded-xl border border-slate-600 bg-[#1C25441] px-4 py-3 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] focus:outline-none search-input ${
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

            {/* SortBy: right in LTR, left in RTL (mirrored via order) */}
            <div
              className={`relative w-[220px] sort-container hidden sm:flex items-center gap-2 ${
                i18n.dir() === "rtl" ? "order-1" : "order-3"
              }`}
            >
              <SortBy
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { value: "name-asc", label: t("sort.nameAsc", "Name A-Z") },
                  { value: "name-desc", label: t("sort.nameDesc", "Name Z-A") },
                  {
                    value: "price-low",
                    label: t("sort.price_low", "Price: Low to High"),
                  },
                  {
                    value: "price-high",
                    label: t("sort.price_high", "Price: High to Low"),
                  },
                  { value: "newest", label: t("sort.newest", "Newest First") },
                ]}
                placeholderKey="sort.placeholder"
              />
            </div>
          </div>
        </section>

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="mb-8">
            <CreateProductForm
              onCreated={handleProductCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Advanced Filters - Optional enhancement */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                !filters.category
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
              }`}
            >
              {t("categories.all", "All")}
            </button>
            <button
              onClick={() => handleCategoryChange("GAMES")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                filters.category === "GAMES"
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
              }`}
            >
              {t("categories.games", "Games")}
            </button>
            <button
              onClick={() => handleCategoryChange("ACCESSORIES")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                filters.category === "ACCESSORIES"
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
              }`}
            >
              {t("categories.accessories", "Accessories")}
            </button>
            <button
              onClick={() => handleCategoryChange("HARDWARE")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                filters.category === "HARDWARE"
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
              }`}
            >
              {t("categories.hardware", "Hardware")}
            </button>
            <button
              onClick={() => handleCategoryChange("SOFTWARE")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                filters.category === "SOFTWARE"
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-[#1C2541] border-slate-600 text-white hover:border-cyan-300"
              }`}
            >
              {t("categories.software", "Software")}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <section className="w-full mt-8 md:mt-6 relative z-0">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage={t("marketplace.noProducts", "No products found")}
            columns={4}
            onProductOpen={handleOpenProduct}
          />
        </section>
      </div>
    </main>
  );
}
