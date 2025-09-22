import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ParsedProduct } from "../../types/products";
import ProductService from "../../services/ProductService";

interface ProductCardProps {
  product: ParsedProduct;
  onProductClick?: (product: ParsedProduct) => void;
  onWishlistToggle?: (productId: number, inWishlist: boolean) => void;
  showWishlistButton?: boolean;
  compact?: boolean;
}

export default function ProductCard({
  product,
  onProductClick,
  onWishlistToggle,
  showWishlistButton = true,
  compact = false,
}: ProductCardProps) {
  const { t } = useTranslation();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const formatPrice = (price: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const response = await ProductService.toggleWishlist(product.id);
      setIsInWishlist(response.inWishlist);

      if (onWishlistToggle) {
        onWishlistToggle(product.id, response.inWishlist);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const cardClasses = `
    group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md
    transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700
    hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden
    ${compact ? "h-64" : "h-80"}
  `;

  const imageClasses = `
    w-full object-cover transition-transform duration-200 group-hover:scale-105
    ${compact ? "h-32" : "h-48"}
  `;

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className={imageClasses}
          />
        ) : (
          <div
            className={`${
              compact ? "h-32" : "h-48"
            } bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}
          >
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlistButton && (
          <button
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
            title={
              isInWishlist
                ? t("product.removeFromWishlist")
                : t("product.addToWishlist")
            }
            aria-label={
              isInWishlist
                ? t("product.removeFromWishlist")
                : t("product.addToWishlist")
            }
            className={`
              absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white
              shadow-sm transition-all duration-200 group/wishlist
              ${isInWishlist ? "text-red-500" : "text-gray-600"}
              ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <svg
              className="w-4 h-4 transition-transform group-hover/wishlist:scale-110"
              fill={isInWishlist ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.freeShipping && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {t("product.freeShipping")}
            </span>
          )}
          {product.condition === "NEW" && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {t("product.new")}
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-3 ${compact ? "space-y-1" : "space-y-2"}`}>
        {/* Title */}
        <h3
          className={`font-medium text-gray-900 dark:text-white line-clamp-2 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {product.brand}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-primary-600 dark:text-primary-400 ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              {formatPrice(product.price, product.currency)}
            </span>
            {product.shippingCost > 0 && (
              <span className="text-xs text-gray-500">
                + {formatPrice(product.shippingCost, product.currency)} shipping
              </span>
            )}
          </div>
        </div>

        {/* Rating and Reviews */}
        {!compact && product.totalReviews > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                {formatRating(product.averageRating)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product.totalReviews} {t("product.reviews")})
            </span>
          </div>
        )}

        {/* Seller Info */}
        {!compact && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {t("product.soldBy")} {product.seller.displayName}
              {product.sellerVerified && (
                <span className="ml-1 text-blue-500">✓</span>
              )}
            </span>
            <span>
              {product.viewCount} {t("product.views")}
            </span>
          </div>
        )}

        {/* Availability */}
        {product.quantityAvailable <= 5 && product.quantityAvailable > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            {t("product.onlyLeft", { count: product.quantityAvailable })}
          </p>
        )}

        {!product.isAvailable && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t("product.outOfStock")}
          </p>
        )}
      </div>
    </div>
  );
}
