import { useState, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";
import * as styles from "../styles/ProductCardStyles";

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

  // Inject responsive CSS
  useEffect(() => {
    const styleId = "product-card-responsive-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = styles.responsiveCSS;

    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  // Detect if text contains Arabic characters
  const hasArabicContent =
    styles.isRTLText(productName) || styles.isRTLText(seller);

  // Dynamic styles based on content language
  const dynamicTitleStyle = styles.getDynamicStyle(
    productName,
    styles.titleStyle
  );
  const dynamicSellerStyle = styles.getDynamicStyle(seller, styles.sellerStyle);
  const dynamicCategoryStyle = styles.getDynamicBadgeStyle(hasArabicContent);
  const dynamicWishlistStyle = styles.getDynamicWishlistStyle(hasArabicContent);

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

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = "#64748b";
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = "#475569";
  };

  const handleDetailsHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#6fffe9";
    e.currentTarget.style.color = "#0f172a";
  };

  const handleDetailsLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = "#6fffe9";
  };

  const handleBuyHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#5ee6d3";
  };

  const handleBuyLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#6fffe9";
  };

  const handleWishlistHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)";
  };

  const handleWishlistLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)";
  };

  return (
    <div
      style={styles.cardStyle}
      className="product-card relative z-20"
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardLeave}
    >
      {/* Image Container */}
      <div style={styles.imageContainerStyle} className="product-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            style={styles.imageStyle}
            loading="lazy"
          />
        ) : (
          <div style={styles.noImageStyle}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>📷</div>
            <span>No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div style={dynamicCategoryStyle}>{category}</div>

        {/* Wishlist Button */}
        <button
          onClick={toggleFavorite}
          style={{
            ...dynamicWishlistStyle,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
          onMouseEnter={handleWishlistHover}
          onMouseLeave={handleWishlistLeave}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content Container */}
      <div style={styles.contentStyle} className="product-card-content">
        {/* Product Title */}
        <h3 style={dynamicTitleStyle} className="product-card-title">
          {productName}
        </h3>

        {/* Seller */}
        <p style={dynamicSellerStyle} className="product-card-seller">
          by <span style={styles.sellerNameStyle}>{seller}</span>
        </p>

        {/* Rating & Reviews */}
        <div style={styles.ratingContainerStyle}>
          <div style={styles.ratingBadgeStyle}>★ {rate}</div>
          <span style={styles.reviewsStyle}>({reviews})</span>
        </div>

        {/* Price and Buttons */}
        <div style={styles.priceContainerStyle}>
          <div style={styles.priceStyle} className="product-card-price">
            {price}
          </div>
          <div style={styles.freeShippingStyle}>Free shipping</div>

          <div
            style={styles.buttonsContainerStyle}
            className="product-card-buttons"
          >
            <button
              style={styles.detailsButtonStyle}
              className="product-card-button"
              onMouseEnter={handleDetailsHover}
              onMouseLeave={handleDetailsLeave}
            >
              Details
            </button>
            <button
              style={styles.buyButtonStyle}
              className="product-card-button"
              onMouseEnter={handleBuyHover}
              onMouseLeave={handleBuyLeave}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
