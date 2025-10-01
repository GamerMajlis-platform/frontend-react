import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import ProductService from "../../services/ProductService";
import type {
  ProductReview,
  ProductRatingDistribution,
} from "../../types/products";
import { getUploadUrl } from "../../lib/urls";

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] =
    useState<ProductRatingDistribution>({
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0,
    });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProductReviews(productId, page);
      setReviews(response.reviews);
      setAverageRating(response.averageRating);
      setTotalReviews(response.totalReviews);
      setRatingDistribution(response.ratingDistribution);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim() || reviewForm.rating < 1) return;

    try {
      setSubmitting(true);
      await ProductService.addProductReview(
        productId,
        reviewForm.rating,
        reviewForm.comment
      );

      // Reset form
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);

      // Reload reviews
      setPage(0);
      await loadReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    const ratingKey = rating.toString() as keyof ProductRatingDistribution;
    return ((ratingDistribution[ratingKey] || 0) / totalReviews) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 font-[Alice-Regular,serif]">
          {t("product.reviewsTitle", "Customer Reviews")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-5xl font-bold text-[var(--color-text)]">
                {averageRating.toFixed(1)}
              </span>
              <div>
                {renderStars(Math.round(averageRating), "lg")}
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {t("product.basedOnReviews", "Based on {{count}} reviews", {
                    count: totalReviews,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const ratingKey =
                rating.toString() as keyof ProductRatingDistribution;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text)] w-8">
                    {rating}{" "}
                    <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{
                        width: `${getRatingPercentage(rating)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)] w-12 text-end">
                    {ratingDistribution[ratingKey] || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          {showReviewForm
            ? t("product.cancelReview", "Cancel")
            : t("product.writeReview", "Write a Review")}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-xl border border-[var(--color-border)] p-6">
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
            {t("product.yourReview", "Your Review")}
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("product.yourRating", "Your Rating")}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="transition-transform hover:scale-110"
                    aria-label={t("product.ratingStar", "Rate {{star}} stars", {
                      star,
                    })}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewForm.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600 hover:text-gray-500"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[var(--color-text)] ltr:ml-3 rtl:mr-3">
                  {reviewForm.rating}/5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t("product.yourComment", "Your Comment")}
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                rows={4}
                dir="auto"
                className="w-full px-4 py-3 bg-black/30 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={t(
                  "product.commentPlaceholder",
                  "Share your experience with this product..."
                )}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !reviewForm.comment.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg font-semibold transition-all"
            >
              {submitting
                ? t("product.submittingReview", "Submitting...")
                : t("product.submitReview", "Submit Review")}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            {t("common.loading", "Loading...")}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-xl border border-[var(--color-border)] p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">
              {t(
                "product.noReviews",
                "No reviews yet. Be the first to review!"
              )}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[var(--color-dark-secondary)]/60 backdrop-blur-sm rounded-xl border border-[var(--color-border)] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.reviewer.profilePictureUrl ? (
                    <img
                      src={
                        getUploadUrl(review.reviewer.profilePictureUrl) ||
                        review.reviewer.profilePictureUrl
                      }
                      alt={review.reviewer.displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.reviewer.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--color-text)]">
                        {review.reviewer.displayName}
                      </span>
                      {review.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating, "sm")}
              </div>
              <p
                className="text-[var(--color-text-secondary)] leading-relaxed"
                dir="auto"
              >
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-[var(--color-dark-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-dark-secondary)]/80 transition-all"
          >
            {t("common.previous", "Previous")}
          </button>
          <span className="px-4 py-2 text-[var(--color-text)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-[var(--color-dark-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-dark-secondary)]/80 transition-all"
          >
            {t("common.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}
