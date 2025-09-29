import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductService from "../services/ProductService";
import type { ParsedProduct } from "../types/products";
import { useAppContext } from "../context/useAppContext";
import { NavigationService } from "../lib/navigation";

export default function ProductDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useAppContext();
  const [product, setProduct] = useState<ParsedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

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
      <div className="p-6">{t("common.loading", "Loading product...")}</div>
    );
  if (!product)
    return (
      <div className="p-6">{t("product.notFound", "Product not found")}</div>
    );

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => NavigationService.navigateTo("/marketplace")}
            className="text-sm text-slate-300 hover:underline"
          >
            ← {t("common.back", "Back")}
          </button>
          <div className="flex items-center gap-2">
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white bg-black/30 hover:bg-black/50"
              aria-pressed={isFavorite ? "true" : "false"}
              aria-label={String(
                isFavorite
                  ? t("product.removeFromWishlist", "Remove from wishlist")
                  : t("product.addToWishlist", "Add to wishlist")
              )}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-700 rounded overflow-hidden">
              {product.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-slate-400">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-white text-2xl font-extrabold">
                ${product.price}
              </div>
              <div className="text-sm text-slate-400">{product.category}</div>
              <div className="text-sm text-slate-400">
                • {product.averageRating || 0} ({product.totalReviews || 0})
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 mb-6">
              {product.description}
            </div>

            <div className="mt-auto flex gap-3 flex-wrap">
              <button className="px-5 py-3 bg-cyan-500 text-black rounded font-semibold">
                {t("product.buyNow", "Buy Now")}
              </button>
              <button
                onClick={() =>
                  NavigationService.navigateTo(
                    `/profile/${product.seller?.id || ""}`
                  )
                }
                className="px-4 py-2 border border-slate-600 rounded text-slate-200 hover:border-cyan-300"
              >
                {t("product.viewSeller", "View Seller")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
