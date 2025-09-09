import { Card, BackgroundDecor } from "../components";
import { useAppContext } from "../context/useAppContext";
import type { WishlistItem } from "../context/AppContext";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const { wishlist } = useAppContext();
  const { t } = useTranslation();

  return (
    <main
      dir="auto"
      className="relative min-h-[calc(100vh-88px)] bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-dark-secondary)] px-4 py-12 font-[Alice-Regular,serif]"
    >
      <BackgroundDecor />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-[3rem] font-light text-[var(--color-text)] mb-4">
            {t("wishlist.title")}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] font-[Alice-Regular,serif] mb-12">
            {t("wishlist.subtitle")}
          </p>
        </header>

        {/* Wishlist Content */}
        <section role="main" className="w-full">
          {wishlist.length > 0 ? (
            <div
              className="
                grid gap-6 
                grid-cols-1 
                sm:grid-cols-2 
                lg:grid-cols-3 
                xl:grid-cols-4
              "
            >
              {wishlist.map((item: WishlistItem) => (
                <div key={item.id} className="flex flex-col">
                  <Card
                    preset="product"
                    id={item.id}
                    category={item.category}
                    productName={item.productName}
                    seller={item.seller}
                    price={item.price}
                    rate={item.rate}
                    reviews={item.reviews}
                    imageUrl={item.imageUrl}
                  />
                  <div className="text-[var(--color-text)] text-sm text-center mt-4 font-medium">
                    {t("wishlist.added")}{" "}
                    {new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--color-dark-secondary)]">
                <svg
                  className="w-10 h-10 text-[var(--color-text-secondary)]"
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
              <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
                {t("wishlist.emptyTitle")}
              </h3>
              <p className="text-base mb-6 text-[var(--color-text-secondary)]">
                {t("wishlist.emptyDesc")}
              </p>
              <button
                className="
                  inline-flex items-center justify-center gap-2
                  px-8 py-3 text-lg font-medium rounded-md 
                  bg-[var(--color-primary)] text-[var(--color-dark)] 
                  transition duration-200 hover:bg-[var(--color-primary-hover)]
                "
              >
                {t("wishlist.browseMarketplace")}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
