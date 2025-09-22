import { apiFetch, createFormData } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import type {
  Product,
  ParsedProduct,
  ProductFormData,
  ProductListResponse,
  ProductResponse,
  ProductReviewsResponse,
  ProductCategoriesResponse,
  ProductImageUploadResponse,
  WishlistToggleResponse,
  ViewRecordResponse,
  ProductSearchParams,
  ProductListParams,
  ProductReview,
} from "../types/products";

/**
 * ProductService - Handles all product/marketplace related API calls
 * Integrates with backend APIs for complete marketplace functionality
 */
export class ProductService {
  /**
   * Parse JSON string fields in product data for easier frontend handling
   */
  private static parseProductJsonFields(product: Product): ParsedProduct {
    try {
      return {
        ...product,
        gameCompatibility: product.gameCompatibility
          ? JSON.parse(product.gameCompatibility)
          : undefined,
        shippingRegions: product.shippingRegions
          ? JSON.parse(product.shippingRegions)
          : undefined,
        specifications: product.specifications
          ? JSON.parse(product.specifications)
          : undefined,
        tags: product.tags ? JSON.parse(product.tags) : undefined,
      };
    } catch (error) {
      console.warn("Failed to parse product JSON fields:", error);
      return product as ParsedProduct;
    }
  }

  /**
   * Convert form data to prepared object for createFormData
   */
  private static prepareProductFormData(
    data: ProductFormData
  ): Record<string, string | Blob> {
    const prepared: Record<string, string | Blob> = {};

    // Add required fields
    prepared.name = data.name;
    prepared.description = data.description;
    prepared.price = data.price.toString();
    prepared.category = data.category;
    prepared.condition = data.condition;

    // Add optional fields if provided
    if (data.currency) prepared.currency = data.currency;
    if (data.subcategory) prepared.subcategory = data.subcategory;
    if (data.conditionDescription)
      prepared.conditionDescription = data.conditionDescription;
    if (data.brand) prepared.brand = data.brand;
    if (data.model) prepared.model = data.model;
    if (data.gameCompatibility)
      prepared.gameCompatibility = JSON.stringify(data.gameCompatibility);
    if (data.quantityAvailable)
      prepared.quantityAvailable = data.quantityAvailable.toString();
    if (data.shippingMethod) prepared.shippingMethod = data.shippingMethod;
    if (data.shippingCost !== undefined)
      prepared.shippingCost = data.shippingCost.toString();
    if (data.freeShipping !== undefined)
      prepared.freeShipping = data.freeShipping.toString();
    if (data.shippingRegions)
      prepared.shippingRegions = JSON.stringify(data.shippingRegions);
    if (data.estimatedDeliveryDays)
      prepared.estimatedDeliveryDays = data.estimatedDeliveryDays.toString();
    if (data.specifications)
      prepared.specifications = JSON.stringify(data.specifications);
    if (data.dimensions) prepared.dimensions = data.dimensions;
    if (data.weight) prepared.weight = data.weight.toString();
    if (data.color) prepared.color = data.color;
    if (data.tags) prepared.tags = JSON.stringify(data.tags);
    if (data.returnPolicy) prepared.returnPolicy = data.returnPolicy;
    if (data.warrantyPeriodDays)
      prepared.warrantyPeriodDays = data.warrantyPeriodDays.toString();
    if (data.warrantyDescription)
      prepared.warrantyDescription = data.warrantyDescription;

    return prepared;
  }

  /**
   * Create a new product listing
   * API: POST /api/products
   */
  static async createProduct(data: ProductFormData): Promise<ParsedProduct> {
    const prepared = this.prepareProductFormData(data);
    const formData = createFormData(prepared);

    const response = await apiFetch<ProductResponse>(
      API_ENDPOINTS.products.create,
      {
        method: "POST",
        body: formData,
      }
    );

    return this.parseProductJsonFields(response.product);
  }

  /**
   * Upload product images
   * API: POST /api/products/{productId}/images
   */
  static async uploadProductImages(
    productId: number,
    images: File[],
    setMainImage = false
  ): Promise<ProductImageUploadResponse> {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("images", image);
    });

    if (setMainImage) {
      formData.append("setMainImage", "true");
    }

    return await apiFetch<ProductImageUploadResponse>(
      `${API_ENDPOINTS.products.uploadImages}/${productId}/images`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /**
   * Get product details by ID
   * API: GET /api/products/{productId}
   */
  static async getProduct(productId: number): Promise<ParsedProduct> {
    const response = await apiFetch<ProductResponse>(
      `${API_ENDPOINTS.products.byId}/${productId}`
    );

    return this.parseProductJsonFields(response.product);
  }

  /**
   * Get products list with filters and pagination
   * API: GET /api/products
   */
  static async getProducts(
    params: ProductListParams = {}
  ): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.condition) queryParams.append("condition", params.condition);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.myProducts !== undefined)
      queryParams.append("myProducts", params.myProducts.toString());

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.products.list}?${queryParams.toString()}`
      : API_ENDPOINTS.products.list;

    return await apiFetch<ProductListResponse>(url);
  }

  /**
   * Update product details
   * API: PUT /api/products/{productId}
   */
  static async updateProduct(
    productId: number,
    data: Partial<ProductFormData>
  ): Promise<ParsedProduct> {
    const prepared: Record<string, string | Blob> = {};

    // Add only the fields that are being updated
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) || typeof value === "object") {
          prepared[key] = JSON.stringify(value);
        } else {
          prepared[key] = value.toString();
        }
      }
    });

    const formData = createFormData(prepared);

    const response = await apiFetch<ProductResponse>(
      `${API_ENDPOINTS.products.update}/${productId}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    return this.parseProductJsonFields(response.product);
  }

  /**
   * Delete a product
   * API: DELETE /api/products/{productId}
   */
  static async deleteProduct(
    productId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiFetch<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.products.delete}/${productId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Add a review to a product
   * API: POST /api/products/{productId}/reviews
   */
  static async addProductReview(
    productId: number,
    rating: number,
    comment?: string,
    verified = false
  ): Promise<{ success: boolean; message: string; review: ProductReview }> {
    const prepared: Record<string, string> = {
      rating: rating.toString(),
      verified: verified.toString(),
    };

    if (comment) {
      prepared.comment = comment;
    }

    const formData = createFormData(prepared);

    return await apiFetch(
      `${API_ENDPOINTS.products.addReview}/${productId}/reviews`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /**
   * Get product reviews with pagination
   * API: GET /api/products/{productId}/reviews
   */
  static async getProductReviews(
    productId: number,
    page = 0,
    size = 10
  ): Promise<ProductReviewsResponse> {
    return await apiFetch<ProductReviewsResponse>(
      `${API_ENDPOINTS.products.getReviews}/${productId}/reviews?page=${page}&size=${size}`
    );
  }

  /**
   * Toggle product in user's wishlist
   * API: POST /api/products/{productId}/wishlist
   */
  static async toggleWishlist(
    productId: number
  ): Promise<WishlistToggleResponse> {
    return await apiFetch<WishlistToggleResponse>(
      `${API_ENDPOINTS.products.toggleWishlist}/${productId}/wishlist`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Record a product view
   * API: POST /api/products/{productId}/view
   */
  static async recordView(productId: number): Promise<ViewRecordResponse> {
    return await apiFetch<ViewRecordResponse>(
      `${API_ENDPOINTS.products.recordView}/${productId}/view`,
      {
        method: "POST",
      }
    );
  }

  /**
   * Search products with filters and pagination
   * API: GET /api/products/search
   */
  static async searchProducts(
    params: ProductSearchParams = {}
  ): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();

    // Always include query parameter (required by backend)
    queryParams.append("query", params.query || "");
    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.condition) queryParams.append("condition", params.condition);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.products.search}?${queryParams.toString()}`
      : API_ENDPOINTS.products.search;

    return await apiFetch<ProductListResponse>(url);
  }

  /**
   * Get product categories and subcategories
   * API: GET /api/products/categories
   */
  static async getCategories(): Promise<ProductCategoriesResponse> {
    return await apiFetch<ProductCategoriesResponse>(
      API_ENDPOINTS.products.categories
    );
  }

  /**
   * Get featured products
   * API: GET /api/products/featured
   */
  static async getFeaturedProducts(limit = 10): Promise<ProductListResponse> {
    return await apiFetch<ProductListResponse>(
      `${API_ENDPOINTS.products.featured}?limit=${limit}`
    );
  }
}

// Export for backward compatibility and convenience
export default ProductService;
