import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor } from "../components";
import { ProductGrid, ProductSearch } from "../components/products";
import ProductService from "../services/ProductService";
import type {
  ParsedProduct,
  ProductSearchParams,
  ProductCategoryType,
  ProductCondition,
} from "../types/products";

// Enhanced CreateProductForm Component
function CreateProductForm({
  onCreated,
  onCancel,
}: {
  onCreated?: () => Promise<void> | void;
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
    if (!formData.description.trim()) {
      newErrors.description = t(
        "product.descriptionRequired",
        "Description is required"
      );
    }
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
        images: file || undefined,
      };

      await ProductService.createProduct(payload);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "GAMES",
        condition: "NEW",
      });
      setFile(null);
      setErrors({});

      if (onCreated) await onCreated();
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
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t("product.createProduct", "Create New Product")}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.name", "Product Name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? "border-red-500" : "border-slate-600"
              }`}
              placeholder={t("product.namePlaceholder", "Enter product name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
              className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.price ? "border-red-500" : "border-slate-600"
              }`}
              placeholder={t("product.pricePlaceholder", "0.00")}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-400">{errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t("product.description", "Description")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.description ? "border-red-500" : "border-slate-600"
            }`}
            placeholder={t(
              "product.descriptionPlaceholder",
              "Describe your product"
            )}
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.category", "Category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ProductCategoryType,
                }))
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t("product.category", "Category")}
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.condition", "Condition")}
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  condition: e.target.value as ProductCondition,
                }))
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t("product.condition", "Condition")}
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
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t("product.image", "Product Image")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white file:mr-4 file:py-1 file:px-3 file:border-0 file:text-sm file:bg-primary-600 file:text-white file:rounded-md hover:file:bg-primary-700"
            aria-label={t("product.image", "Product Image")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading
              ? t("product.creating", "Creating...")
              : t("product.create", "Create Product")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md transition-colors"
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
  const { t } = useTranslation();
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  // Handle search params change from ProductSearch component
  const handleSearchParamsChange = useCallback(
    (searchParams: ProductSearchParams) => {
      loadProducts(searchParams);
    },
    [loadProducts]
  );

  // Handle product creation success
  const handleProductCreated = useCallback(async () => {
    await loadProducts();
    setShowCreateForm(false);
  }, [loadProducts]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <BackgroundDecor />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("marketplace.title", "Gaming Marketplace")}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t(
              "marketplace.subtitle",
              "Discover premium gaming gear from trusted sellers worldwide"
            )}
          </p>
        </header>

        {/* Create Product Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {showCreateForm
              ? t("common.cancel", "Cancel")
              : t("product.createProduct", "Create Product")}
          </button>
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <CreateProductForm
            onCreated={handleProductCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Search and Filters */}
        <div className="mb-8 max-w-4xl mx-auto">
          <ProductSearch
            onSearchParamsChange={handleSearchParamsChange}
            autoSearch={true}
            showFilters={true}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={t("marketplace.noProducts", "No products found")}
          columns={4}
        />
      </div>
    </main>
  );
}
