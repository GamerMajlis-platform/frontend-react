import { useState, useRef, useEffect } from "react";
import { ProductCard, BackgroundDecor } from "../components";
import * as styles from "../styles/MarketplaceStyles";
import { productData, sortOptions, type SortOption } from "../data";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inject responsive CSS
  useEffect(() => {
    const styleId = "marketplace-responsive-styles";
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parsePrice = (priceString: string): number => {
    return parseFloat(priceString.replace("$", ""));
  };

  const parseReviews = (reviewsString: string): number => {
    const matches = reviewsString.match(/(\d+(?:,\d+)*)/);
    return matches ? parseInt(matches[1].replace(/,/g, ""), 10) : 0;
  };

  const sortedAndFilteredProducts = productData
    .filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName);
        case "price-low":
          return parsePrice(a.price) - parsePrice(b.price);
        case "price-high":
          return parsePrice(b.price) - parsePrice(a.price);
        case "rating":
          return parseFloat(b.rate) - parseFloat(a.rate);
        case "reviews":
          return parseReviews(b.reviews) - parseReviews(a.reviews);
        default:
          return 0;
      }
    });

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  const handleFilterHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "#6fffe9";
    e.currentTarget.style.color = "#0f172a";
  };

  const handleFilterLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = "#6fffe9";
  };

  return (
    <main
      style={styles.containerStyle}
      className="marketplace-container relative z-10"
    >
      <BackgroundDecor />
      <div style={styles.maxWidthContainerStyle} className="relative z-10">
        {/* Header Section */}
        <header style={styles.headerStyle} className="marketplace-header">
          <h1
            style={{
              ...styles.getDynamicTextStyle(
                "Gaming Marketplace",
                styles.titleStyle
              ),
              textAlign: "center",
            }}
            className="marketplace-title"
          >
            Gaming Marketplace
          </h1>
          <p
            style={styles.getDynamicTextStyle(
              "Discover premium gaming gear from trusted sellers worldwide",
              styles.subtitleStyle
            )}
            className="marketplace-subtitle"
          >
            Discover premium gaming gear from trusted sellers worldwide
          </p>
        </header>

        {/* Search and Filter Section */}
        <section style={styles.searchSectionStyle} className="search-section">
          <div style={styles.searchControlsStyle} className="search-controls">
            <input
              type="text"
              placeholder="Search for gaming gear, accessories..."
              style={styles.searchInputStyle}
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />

            <div
              style={styles.sortContainerStyle}
              className="sort-container"
              ref={dropdownRef}
            >
              <button
                style={styles.sortButtonStyle}
                className="sort-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5ee6d3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6fffe9";
                }}
              >
                <span>
                  {sortOptions.find((option) => option.value === sortBy)
                    ?.label || "Sort By"}
                </span>
                <span
                  style={{
                    transform: isDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div style={styles.sortDropdownStyle}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      style={{
                        ...styles.sortOptionStyle,
                        backgroundColor:
                          sortBy === option.value ? "#334155" : "transparent",
                      }}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        if (sortBy !== option.value) {
                          e.currentTarget.style.backgroundColor = "#334155";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== option.value) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.filterButtonsStyle} className="filter-buttons">
            <button
              style={styles.filterButtonStyle}
              className="filter-button"
              onMouseEnter={handleFilterHover}
              onMouseLeave={handleFilterLeave}
            >
              All Items
            </button>
            <button
              style={styles.filterButtonStyle}
              className="filter-button"
              onMouseEnter={handleFilterHover}
              onMouseLeave={handleFilterLeave}
            >
              Gaming Gear
            </button>
            <button
              style={styles.filterButtonStyle}
              className="filter-button"
              onMouseEnter={handleFilterHover}
              onMouseLeave={handleFilterLeave}
            >
              Console
            </button>
            <button
              style={styles.filterButtonStyle}
              className="filter-button"
              onMouseEnter={handleFilterHover}
              onMouseLeave={handleFilterLeave}
            >
              PC Parts
            </button>
            <button
              style={styles.filterButtonStyle}
              className="filter-button"
              onMouseEnter={handleFilterHover}
              onMouseLeave={handleFilterLeave}
            >
              Audio
            </button>
          </div>
        </section>

        {/* Products Grid */}
        <section style={styles.gridContainerStyle} className="products-grid">
          {sortedAndFilteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              category={product.category}
              productName={product.productName}
              seller={product.seller}
              price={product.price}
              rate={product.rate}
              reviews={product.reviews}
              imageUrl={product.imageUrl}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
