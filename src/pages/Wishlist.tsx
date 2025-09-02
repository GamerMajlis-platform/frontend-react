import { ProductCard } from "../components";
import { useAppContext } from "../context/AppContext";
import { wishlistPage, wishlistTitle, button } from "../styles/OptimizedStyles";

export default function Wishlist() {
  const { wishlist } = useAppContext();

  return (
    <main style={wishlistPage}>
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header Section */}
        <header
          style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}
        >
          <h1 style={wishlistTitle}>My Wishlist</h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              textAlign: "center",
              marginBottom: "var(--spacing-xl)",
              fontFamily: "Alice-Regular, serif",
            }}
          >
            Your favorite gaming gear saved for later
          </p>
        </header>

        {/* Wishlist Content */}
        <section style={{ width: "100%" }} role="main">
          {wishlist.length > 0 ? (
            <div className="wishlist-grid">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <ProductCard
                    id={item.id}
                    category={item.category}
                    productName={item.productName}
                    seller={item.seller}
                    price={item.price}
                    rate={item.rate}
                    reviews={item.reviews}
                    imageUrl={item.imageUrl}
                  />
                  {/* Date added - below the product card */}
                  <div
                    style={{
                      color: "var(--color-text)",
                      fontSize: "0.875rem",
                      textAlign: "center",
                      marginTop: "var(--spacing-md)",
                      fontWeight: "500",
                    }}
                  >
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div
              style={{
                textAlign: "center",
                padding: "var(--spacing-xl)",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto var(--spacing-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--color-dark-secondary)",
                  borderRadius: "var(--border-radius-full)",
                }}
              >
                <svg
                  style={{
                    width: "40px",
                    height: "40px",
                    color: "var(--color-text-secondary)",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--color-text)",
                  marginBottom: "var(--spacing-sm)",
                }}
              >
                Your Wishlist is Empty
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  marginBottom: "var(--spacing-lg)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Start adding items from the marketplace to see them here
              </p>
              <button style={button("primary", "lg")}>
                Browse Marketplace
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
