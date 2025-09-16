import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, BackgroundDecor, SortBy, IconSearch } from "../components";
import { productData, sortOptions, type SortOption } from "../data";
import useIsMobile from "../hooks/useIsMobile";

// Utility function to detect RTL text
const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

export default function Marketplace() {
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");

  // Filter categories: keep canonical values for filtering and translation keys for display
  const categories = [
    { value: "All Items", labelKey: "categories.allItems" },
    { value: "Gaming Gear", labelKey: "categories.gamingGear" },
    { value: "Console", labelKey: "categories.console" },
    { value: "PC Parts", labelKey: "categories.pcParts" },
    { value: "Audio", labelKey: "categories.audio" },
  ];

  // SortBy component handles dropdown state and outside clicks

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
      const collator = new Intl.Collator(i18n.language === "ar" ? "ar" : "en", {
        sensitivity: "base",
      });
      switch (sortBy) {
        case "name":
          return collator.compare(a.productName, b.productName);
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
              ${isRTLText(t("marketplace.title")) ? "font-tahoma" : "font-sans"}
            `}
          >
            {t("marketplace.title")}
          </h1>
          <p
            className={`
              mx-auto max-w-[600px] text-xl text-cyan-300 marketplace-subtitle
              md:max-w-[90%] md:text-lg
              ${
                isRTLText(
                  "Discover premium gaming gear from trusted sellers worldwide"
                )
                  ? "font-tahoma text-center"
                  : "font-sans text-center"
              }
            `}
          >
            {t("marketplace.subtitle")}
          </p>
        </header>

        {/* Search and Filter Section */}
        <section className="mb-12 search-section md:mb-8 relative z-10">
          {/* Search and Sort Row */}
          <div
            className="mb-6 flex w-full max-w-[800px] mx-auto items-center gap-3 search-controls"
            dir={i18n.dir()}
          >
            <input
              type="text"
              ref={searchRef}
              placeholder={
                isMobile
                  ? t("common.search")
                  : t("marketplace.searchPlaceholder")
              }
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
            {/* Mobile search icon button */}
            <button
              type="button"
              aria-label={t("common.search")}
              className={`sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-cyan-300 transition-all ${
                i18n.dir() === "rtl" ? "mr-auto" : "ml-auto"
              }`}
              onClick={() => searchRef.current?.focus()}
            >
              <IconSearch />
            </button>

            {/* Sort dropdown hidden on mobile */}
            <div className="relative w-[140px] sort-container hidden sm:block">
              <SortBy
                options={sortOptions}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                placeholderKey={"tournaments.sort.placeholder"}
              />
            </div>
          </div>

          {/* Filter Buttons Row */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 filter-buttons mb-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`
                  rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 
                  filter-button
                  ${
                    selectedCategory === cat.value
                      ? "border-cyan-300 bg-cyan-300 text-slate-900"
                      : "border-cyan-300 bg-transparent text-cyan-300 hover:bg-cyan-300 hover:text-slate-900"
                  }
                `}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {t(cat.labelKey)}
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
            <Card
              key={product.id}
              preset="product"
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
