import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackgroundDecor } from "../components";
import * as styles from "../styles/MarketplaceStyles";
import { type SortOption, sortOptions } from "../data";

export default function Tournaments() {
  const { t } = useTranslation();

  // Search / Sort state (copied from Marketplace)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Category filter state
  type Category = "upcoming" | "ongoing" | "past";
  const [category, setCategory] = useState<Category>("upcoming");

  // Close dropdown on outside click
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

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6fffe9";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(111, 255, 233, 0.1)";
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#475569";
    e.currentTarget.style.boxShadow = "none";
  };

  // Styles specific to the tournaments category filter
  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "100px", // from Figma
    width: "100%",
    margin: "0 auto 28px auto",
    flexWrap: "wrap",
  };

  const optionBase: React.CSSProperties = {
    height: "45px",
    padding: "0 24px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    fontSize: "22px", // slightly smaller than figma 26 for better responsiveness
    lineHeight: "31px",
    cursor: "pointer",
    border: "none",
    background: "transparent",
  };

  const getOptionStyle = (key: Category): React.CSSProperties => {
    const active = category === key;
    return {
      ...optionBase,
      background: active ? "#6FFFE9" : "transparent",
      color: active ? "#000000" : "#FFFFFF",
    };
  };

  return (
    <main
      style={styles.containerStyle}
      className="tournaments-container relative z-10"
    >
      <BackgroundDecor />

      <div style={styles.maxWidthContainerStyle} className="relative z-10">
        {/* Page Label */}
        <header style={styles.headerStyle} className="tournaments-header">
          <h1 style={styles.titleStyle} className="tournaments-title">
            {t("nav.tournaments")}
          </h1>
        </header>

        {/* Category Filter (between label and search) */}
        <div style={filterBarStyle} aria-label="Tournament category filter">
          <button
            style={getOptionStyle("upcoming")}
            onClick={() => setCategory("upcoming")}
          >
            Upcoming
          </button>
          <button
            style={getOptionStyle("ongoing")}
            onClick={() => setCategory("ongoing")}
          >
            Ongoing
          </button>
          <button
            style={getOptionStyle("past")}
            onClick={() => setCategory("past")}
          >
            Past
          </button>
        </div>

        {/* Search and Sort controls (copied from Marketplace) */}
        <section style={styles.searchSectionStyle} className="search-section">
          <div style={styles.searchControlsStyle} className="search-controls">
            <input
              type="text"
              placeholder="Search tournaments, organizers..."
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
        </section>

        {/* Placeholder for future tournament cards filtered by category/search/sort */}
        <section style={{ paddingTop: "8px", paddingBottom: "24px" }}>
          {/* TODO: Render tournament cards here based on `category`, `searchTerm`, and `sortBy` */}
        </section>
      </div>
    </main>
  );
}
