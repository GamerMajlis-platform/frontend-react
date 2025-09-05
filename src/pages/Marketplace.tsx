import { useState, useRef, useEffect } from "react";
import { ProductCard, BackgroundDecor } from "../components";
import { productData, sortOptions, type SortOption } from "../data";

// Utility function to detect RTL text
const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter categories
  const categories = [
    "All Items",
    "Gaming Gear",
    "Console",
    "PC Parts",
    "Audio",
  ];

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
    .filter((product) => {
      if (selectedCategory === "All Items") return true;
      return product.category
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
    })
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

  return (
    <main className="relative z-10 min-h-[calc(100vh-88px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 marketplace-container md:px-3 sm:px-3">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1400px] max-width-container">
        {/* Header Section */}
        <header className="mb-12 text-center marketplace-header md:mb-8">
          <h1
            className={`
              mb-4 text-5xl font-bold text-white drop-shadow-md marketplace-title
              md:text-4xl
              sm:text-3xl
              ${isRTLText("Gaming Marketplace") ? "font-tahoma" : "font-sans"}
            `}
          >
            Gaming Marketplace
          </h1>
          <p
            className={`
              mx-auto max-w-[600px] text-xl text-cyan-300 marketplace-subtitle
              md:max-w-[90%] md:text-lg
              ${
                isRTLText(
                  "Discover premium gaming gear from trusted sellers worldwide"
                )
                  ? "font-tahoma text-right"
                  : "font-sans text-left"
              }
            `}
          >
            Discover premium gaming gear from trusted sellers worldwide
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 search-section md:mb-8 relative z-10">
          {/* Search and Sort Row */}
          <div className="mb-6 flex w-full max-w-[800px] mx-auto items-center gap-3 search-controls">
            <input
              type="text"
              placeholder="Search for gaming gear, accessories..."
              className="
                h-12 w-full flex-1 rounded-xl border border-slate-600 
                bg-slate-800 px-4 py-3 text-white placeholder-slate-400 
                transition-all duration-300 focus:border-cyan-300 
                focus:shadow-[0_0_0_3px_rgba(111,255,233,0.1)] 
                focus:outline-none search-input
              "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div
              className="relative w-[140px] sort-container"
              ref={dropdownRef}
            >
              <button
                className="
                  flex h-12 w-full items-center justify-between 
                  rounded-xl border-none bg-cyan-300 px-3 py-3 text-slate-900 
                  transition-colors duration-200 hover:bg-cyan-200 sort-button
                  text-sm font-medium
                "
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="truncate">Sort by</span>
                <span
                  className={`ml-1 transform transition-transform duration-300 ease-in-out ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  className="
                  absolute top-full right-0 z-50 mt-2 w-56 rounded-xl 
                  border border-slate-600 bg-slate-800 p-2 shadow-2xl sort-dropdown
                  backdrop-blur-sm
                "
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`
                        block w-full rounded-md border-none px-3 py-2 text-left 
                        text-white transition-colors duration-200 text-sm
                        hover:bg-slate-700
                        ${
                          sortBy === option.value
                            ? "bg-slate-700"
                            : "bg-transparent"
                        }
                      `}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Buttons Row */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 filter-buttons mb-8">
            {categories.map((category) => (
              <button
                key={category}
                className={`
                  rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 
                  filter-button
                  ${
                    selectedCategory === category
                      ? "border-cyan-300 bg-cyan-300 text-slate-900"
                      : "border-cyan-300 bg-transparent text-cyan-300 hover:bg-cyan-300 hover:text-slate-900"
                  }
                `}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section
          className="
          grid grid-cols-1 justify-items-center gap-8 products-grid
          min-[900px]:grid-cols-2
          xl:grid-cols-3
          md:gap-6
          sm:gap-4
          mt-8 md:mt-6 relative z-0
        "
        >
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
