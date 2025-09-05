import { useState, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";

interface ProductCardProps {
  id: number;
  category: string;
  productName: string;
  seller: string;
  price: string;
  rate: string;
  reviews: string;
  imageUrl?: string;
}

// Utility function to detect RTL text
const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

export default function ProductCard({
  id,
  category,
  productName,
  seller,
  price,
  rate,
  reviews,
  imageUrl,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDetailsHovered, setIsDetailsHovered] = useState(false);
  const [isBuyHovered, setIsBuyHovered] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);

  // Detect if text contains Arabic characters
  const hasArabicContent = isRTLText(productName) || isRTLText(seller);

  useEffect(() => {
    setIsFavorite(isInWishlist(id));
  }, [id, isInWishlist]);

  const toggleFavorite = () => {
    toggleWishlist({
      id,
      category,
      productName,
      seller,
      price,
      rate,
      reviews,
      imageUrl,
    });
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      className={`
        group relative z-20 flex h-[520px] sm:h-[480px] md:h-[500px] lg:h-[560px]
        w-full max-w-[420px] min-w-[280px] 
        flex-col overflow-hidden rounded-2xl border border-slate-600 
        bg-slate-800 shadow-lg transition-all duration-300 ease-in-out 
        hover:border-slate-500 hover:shadow-xl product-card
      `}
    >
      {/* Image Container */}
      <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] shrink-0 bg-slate-700 product-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="mb-2 text-3xl sm:text-4xl">📷</div>
            <span className="text-xs sm:text-sm">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div
          className={`
            absolute top-2 sm:top-3 max-w-[100px] sm:max-w-[120px] overflow-hidden text-ellipsis 
            whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs 
            font-semibold text-black
            ${
              hasArabicContent
                ? "right-2 sm:right-3 left-auto"
                : "left-2 sm:left-3 right-auto"
            }
          `}
        >
          {category}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleFavorite}
          className={`
            absolute top-2 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center 
            rounded-full border border-white/20 text-sm sm:text-base text-white 
            transition-all duration-200 ease-in-out
            ${
              hasArabicContent
                ? "left-2 sm:left-3 right-auto"
                : "right-2 sm:right-3 left-auto"
            }
            ${isWishlistHovered ? "bg-black/50" : "bg-black/30"}
          `}
          onMouseEnter={() => setIsWishlistHovered(true)}
          onMouseLeave={() => setIsWishlistHovered(false)}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content Container */}
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-5 product-card-content">
        {/* Product Title */}
        <h3
          className={`
            mb-2 sm:mb-2.5 line-clamp-3 min-h-[54px] sm:min-h-[60px] md:min-h-[64px] lg:min-h-[72px] 
            text-sm sm:text-base lg:text-[17px] font-semibold 
            leading-relaxed text-white product-card-title
            ${
              hasArabicContent
                ? "text-right font-scheherazade"
                : "text-left font-sans"
            }
          `}
        >
          {productName}
        </h3>

        {/* Seller */}
        <p
          className={`
            mb-3 sm:mb-3.5 line-clamp-2 min-h-[28px] sm:min-h-[32px] md:min-h-[36px] lg:min-h-[40px] 
            text-xs sm:text-sm leading-relaxed 
            text-slate-400 product-card-seller
            ${
              hasArabicContent
                ? "text-right font-scheherazade"
                : "text-left font-sans"
            }
          `}
        >
          by <span className="font-medium text-primary">{seller}</span>
        </p>

        {/* Rating & Reviews */}
        <div
          className={`
            mb-3 sm:mb-3.5 flex items-center gap-2
            ${hasArabicContent ? "flex-row-reverse" : "flex-row"}
          `}
        >
          <div className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-500">
            ★ {rate}
          </div>
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>

        {/* Price and Buttons */}
        <div className="mt-auto pt-2 sm:pt-3 lg:pt-3.5 pb-1">
          <div
            className={`
              mb-1 text-base sm:text-lg font-bold text-white product-card-price
              ${hasArabicContent ? "text-right" : "text-left"}
            `}
          >
            {price}
          </div>
          <div
            className={`
              mb-2 sm:mb-3 text-xs text-slate-500
              ${hasArabicContent ? "text-right" : "text-left"}
            `}
          >
            Free shipping
          </div>

          <div
            className={`
              mt-2 flex gap-2 sm:gap-2.5 product-card-buttons
              ${hasArabicContent ? "flex-row-reverse" : "flex-row"}
            `}
          >
            <button
              className={`
                flex-1 rounded-md border border-primary bg-transparent 
                px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium transition-colors duration-200 
                ease-in-out product-card-button
                ${
                  isDetailsHovered
                    ? "bg-[#5ee6d3] text-black border-[#5ee6d3]"
                    : "text-primary"
                }
              `}
              onMouseEnter={() => setIsDetailsHovered(true)}
              onMouseLeave={() => setIsDetailsHovered(false)}
            >
              Details
            </button>
            <button
              className={`
                flex-1 rounded-md border-none bg-primary px-3 sm:px-4 py-2 sm:py-2.5 
                text-xs font-semibold text-black transition-colors 
                duration-200 ease-in-out product-card-button
                ${isBuyHovered ? "bg-[#5ee6d3]" : ""}
              `}
              onMouseEnter={() => setIsBuyHovered(true)}
              onMouseLeave={() => setIsBuyHovered(false)}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
