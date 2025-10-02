import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart, Store, ShoppingCart, Star } from "lucide-react";
import ProductService from "../services/ProductService";
import type { ParsedProduct } from "../types/products";
import { useAppContext } from "../context/useAppContext";
import { getUploadUrl } from "../lib/urls";
import { BackgroundDecor } from "../components";
import ProductReviews from "../components/products/ProductReviews";

export default function ProductDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useAppContext();
  const [product, setProduct] = useState<ParsedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Translation helpers
  const translateCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      GAMING_CONSOLES: t("categories.gamingConsoles", "Gaming Consoles"),
      GAMING_ACCESSORIES: t(
        "categories.gamingAccessories",
        "Gaming Accessories"
      ),
      PC_COMPONENTS: t("categories.pcComponents", "PC Components"),
      GAMING_PERIPHERALS: t(
        "categories.gamingPeripherals",
        "Gaming Peripherals"
      ),
      GAMING_CHAIRS: t("categories.gamingChairs", "Gaming Chairs"),
      HEADSETS: t("categories.headsets", "Headsets"),
      KEYBOARDS: t("categories.keyboards", "Keyboards"),
      MICE: t("categories.mice", "Mice"),
      MONITORS: t("categories.monitors", "Monitors"),
      GAMES: t("categories.games", "Games"),
      COLLECTIBLES: t("categories.collectibles", "Collectibles"),
      MERCHANDISE: t("categories.merchandise", "Merchandise"),
      OTHER: t("categories.other", "Other"),
    };
    return categoryMap[category] || category;
  };

  const translateCondition = (condition: string) => {
    const conditionMap: Record<string, string> = {
      NEW: t("product.conditions.new", "New"),
      LIKE_NEW: t("product.conditions.likeNew", "Like New"),
      EXCELLENT: t("product.conditions.excellent", "Excellent"),
      GOOD: t("product.conditions.good", "Good"),
      FAIR: t("product.conditions.fair", "Fair"),
      POOR: t("product.conditions.poor", "Poor"),
      REFURBISHED: t("product.conditions.refurbished", "Refurbished"),
      FOR_PARTS: t("product.conditions.forParts", "For Parts"),
    };
    return conditionMap[condition] || condition;
  };

  // Get navigation state to determine where we came from
  const state = location.state as { from?: string; scrollY?: number } | null;
  const sourcePage = state?.from || "marketplace";
  const scrollY = state?.scrollY;

  // Get all product images
  // Backend returns imageUrls array which includes mainImageUrl as first element
  // So we use imageUrls if available, otherwise fall back to mainImageUrl only
  const productImages = product
    ? product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.mainImageUrl
      ? [product.mainImageUrl]
      : []
    : [];

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const p = await ProductService.getProduct(Number(id));
        if (mounted) setProduct(p || null);
      } catch (err) {
        console.error("Failed to load product details", err);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (product) setIsFavorite(isInWishlist(product.id));
  }, [product, isInWishlist]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-dark-secondary)]">
        <div className="text-[var(--color-text)]">
          {t("common.loading", "Loading product...")}
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-dark-secondary)]">
        <div className="text-[var(--color-text)]">
          {t("product.notFound", "Product not found")}
        </div>
      </div>
    );

  return (
    <main
      dir="auto"
      className="relative min-h-screen bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-dark-secondary)] py-8 px-4 sm:px-6 lg:px-8"
    >
      <BackgroundDecor />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Back Button and Actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Back Button - RTL optimized */}
          <button
            onClick={() => navigate(`/${sourcePage}`, { state: { scrollY } })}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-dark-secondary)]/80 hover:bg-[var(--color-dark-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="text-sm font-medium">
              {t("common.back", "Back")}
            </span>
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => {
              toggleWishlist({
                id: product.id,
                category: product.category,
                productName: product.name,
                seller: product.seller?.displayName || "",
                price: `${product.price}`,
                rate: `${product.averageRating || 0}`,
                reviews: `${product.totalReviews || 0}`,
                imageUrl: product.mainImageUrl,
              });
              setIsFavorite((v) => !v);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-dark-secondary)]/80 hover:bg-[var(--color-dark-secondary)] border border-[var(--color-border)] rounded-lg transition-all hover:scale-105"
            aria-label={
              isFavorite
                ? t("product.removeFromWishlist", "Remove from wishlist")
                : t("product.addToWishlist", "Add to wishlist")
            }
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-[var(--color-text)]"
              }`}
            />
            <span className="text-sm font-medium text-[var(--color-text)] hidden sm:inline">
              {isFavorite
                ? t("product.inWishlist", "In Wishlist")
                : t("product.addToWishlist", "Add to Wishlist")}
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image Display */}
              <div className="bg-black/30 rounded-lg overflow-hidden border border-[var(--color-border)]">
                {productImages.length > 0 ? (
                  <img
                    src={
                      getUploadUrl(productImages[selectedImageIndex]) ||
                      productImages[selectedImageIndex]
                    }
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-auto object-cover aspect-square"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-[var(--color-text-secondary)]">
                    {t("product.noImage", "No image")}
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImageIndex === index
                          ? "border-cyan-500 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20"
                          : "border-[var(--color-border)] hover:border-cyan-500/50"
                      }`}
                    >
                      <img
                        src={getUploadUrl(imageUrl) || imageUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col space-y-6">
              {/* Title and Category */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3 font-[Alice-Regular,serif]">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
                    {translateCategory(product.category)}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                    {translateCondition(product.condition)}
                  </span>
                </div>
              </div>

              {/* Price and Rating */}
              <div className="flex items-center justify-between py-4 border-y border-[var(--color-border)]">
                <div>
                  <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                    {t("product.price", "Price")}
                  </div>
                  <div className="text-4xl font-bold text-cyan-400">
                    ${product.price}
                  </div>
                </div>
                <div className="text-end">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-[var(--color-text)]">
                      {product.averageRating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {product.totalReviews || 0}{" "}
                    {t("product.reviews", "reviews")}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  {t("product.description", "Description")}
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="p-4 bg-black/20 border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.seller.profilePictureUrl ? (
                        <img
                          src={
                            getUploadUrl(product.seller.profilePictureUrl) ||
                            product.seller.profilePictureUrl
                          }
                          alt={product.seller.displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {product.seller.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-[var(--color-text-secondary)] mb-0.5">
                          {t("product.seller", "Seller")}
                        </div>
                        <div className="font-medium text-[var(--color-text)]">
                          {product.seller.displayName}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/profile/${product.seller?.id || ""}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 border border-cyan-500/50 hover:bg-cyan-500/10 rounded-lg text-cyan-400 transition-all hover:scale-105"
                    >
                      <Store className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">
                        {t("product.viewProfile", "View Profile")}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-cyan-500/20">
                  <ShoppingCart className="w-5 h-5" />
                  {t("product.buyNow", "Buy Now")}
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-cyan-500 hover:bg-cyan-500/10 rounded-lg text-cyan-400 font-semibold transition-all hover:scale-105">
                  {t("product.addToCart", "Add to Cart")}
                </button>
              </div>
            </div>
          </div>

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </main>
  );
}
