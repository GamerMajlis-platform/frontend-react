// Product and marketplace related types

export type ProductCondition =
  | "NEW"
  | "USED_LIKE_NEW"
  | "USED_GOOD"
  | "USED_FAIR"
  | "USED_POOR";

export type ProductCategoryType =
  | "ACCESSORIES"
  | "HARDWARE"
  | "GAMES"
  | "SOFTWARE"
  | "MERCHANDISE";

export type ProductStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SOLD"
  | "INACTIVE"
  | "SUSPENDED";

export type ShippingMethod = "STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProductImage {
  id: number;
  url: string;
  isMainImage: boolean;
}

export interface ProductSeller {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
  sellerVerified?: boolean;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment?: string;
  verified: boolean;
  reviewer: {
    id: number;
    displayName: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
}

export interface ProductRatingDistribution {
  "5": number;
  "4": number;
  "3": number;
  "2": number;
  "1": number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: ProductCategoryType;
  subcategory?: string;
  condition: ProductCondition;
  conditionDescription?: string;
  brand?: string;
  model?: string;
  gameCompatibility?: string; // JSON array string
  quantityAvailable: number;
  quantitySold: number;
  isAvailable: boolean;
  status: ProductStatus;
  seller: ProductSeller;
  sellerVerified: boolean;
  mainImageUrl?: string;
  imageUrls?: string[];
  shippingMethod: ShippingMethod;
  shippingCost: number;
  freeShipping: boolean;
  shippingRegions?: string; // JSON array string
  estimatedDeliveryDays?: number;
  specifications?: string; // JSON object string
  dimensions?: string;
  weight?: number;
  color?: string;
  tags?: string; // JSON array string
  averageRating: number;
  totalReviews: number;
  viewCount: number;
  wishlistCount: number;
  inquiryCount: number;
  returnPolicy?: string;
  warrantyPeriodDays?: number;
  warrantyDescription?: string;
  moderationStatus: ModerationStatus;
  isFeatured?: boolean;
  createdAt: string;
  listedAt?: string;
}

// Parsed JSON fields for easier frontend handling
export interface ParsedProduct
  extends Omit<
    Product,
    "gameCompatibility" | "shippingRegions" | "specifications" | "tags"
  > {
  gameCompatibility?: string[];
  shippingRegions?: string[];
  specifications?: Record<string, string | number | boolean>;
  tags?: string[];
}

export interface ProductCategory {
  name: string;
  displayName: string;
  subcategories: string[];
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

export interface ProductReviewsResponse {
  success: boolean;
  message: string;
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: ProductRatingDistribution;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductCategoriesResponse {
  success: boolean;
  message: string;
  categories: ProductCategory[];
}

export interface ProductImageUploadResponse {
  success: boolean;
  message: string;
  images: ProductImage[];
}

export interface WishlistToggleResponse {
  success: boolean;
  message: string;
  inWishlist: boolean;
  newWishlistCount: number;
}

export interface ViewRecordResponse {
  success: boolean;
  message: string;
  newViewCount: number;
}

// Form types for creating/updating products
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: ProductCategoryType;
  subcategory?: string;
  condition: ProductCondition;
  conditionDescription?: string;
  brand?: string;
  model?: string;
  gameCompatibility?: string[];
  quantityAvailable?: number;
  shippingMethod?: ShippingMethod;
  shippingCost?: number;
  freeShipping?: boolean;
  shippingRegions?: string[];
  estimatedDeliveryDays?: number;
  specifications?: Record<string, string | number | boolean>;
  dimensions?: string;
  weight?: number;
  color?: string;
  tags?: string[];
  returnPolicy?: string;
  warrantyPeriodDays?: number;
  warrantyDescription?: string;
}

// Search and filter types
export interface ProductSearchParams {
  query?: string;
  page?: number;
  size?: number;
  category?: ProductCategoryType;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: "price" | "createdAt" | "rating" | "views" | "wishlist";
  sortOrder?: "asc" | "desc";
  myProducts?: boolean;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  category?: ProductCategoryType;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: "price" | "createdAt" | "rating" | "views" | "wishlist";
  sortOrder?: "asc" | "desc";
  myProducts?: boolean;
}
