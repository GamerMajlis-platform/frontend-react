import { BaseService } from "../lib/baseService";
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
export class ProductService extends BaseService {
  /**
   * Parse JSON string fields in product data for easier frontend handling
   */
  private static parseProductJsonFields(product: Product): ParsedProduct {
    if (!product) {
      throw new Error("Product data is missing from response");
    }
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
    const formData = this.createFormData(prepared);

    try {
      const response = await this.authenticatedRequest<ProductResponse>(
        API_ENDPOINTS.products.create,
        {
          method: "POST",
          body: formData,
        }
      );

      // Log response for debugging
      console.log("Create product response:", response);

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.product) {
        console.error("Response structure:", JSON.stringify(response, null, 2));
        throw new Error(
          "Invalid response from server: product data is missing"
        );
      }

      return this.parseProductJsonFields(response.product);
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  }

  /**
   * Upload product images
   * API: POST /api/products/{productId}/images
   * Images are uploaded as multipart/form-data
   * The backend will store them in format: /uploads/products/{imageUrl}
   * The mainImageUrl in product object will be: {{baseUrl}}uploads/products/{{imageUrl}}
   */
  static async uploadProductImages(
    productId: number,
    images: File[],
    setMainImage = false
  ): Promise<ProductImageUploadResponse> {
    const formData = new FormData();

    // Append each image file with the key "images" (array)
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Optional: set first uploaded image as main image
    if (setMainImage) {
      formData.append("setMainImage", "true");
    }

    return await this.authenticatedRequest<ProductImageUploadResponse>(
      `${API_ENDPOINTS.products.byId}/${productId}/images`,
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
    const response = await this.requestWithRetry<ProductResponse>(
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

    return await this.requestWithRetry<ProductListResponse>(url);
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

    const formData = this.createFormData(prepared);
    const response = await this.authenticatedRequest<ProductResponse>(
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
    console.log("ProductService.deleteProduct called with ID:", productId);
    const endpoint = `${API_ENDPOINTS.products.delete}/${productId}`;
    console.log("Delete endpoint:", endpoint);

    try {
      const response = await this.authenticatedRequest<{
        success: boolean;
        message: string;
      }>(endpoint, {
        method: "DELETE",
      });
      console.log("ProductService.deleteProduct response:", response);
      return response;
    } catch (error) {
      console.error("ProductService.deleteProduct error:", error);
      throw error;
    }
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
    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("verified", verified.toString());

    if (comment && comment.trim()) {
      formData.append("comment", comment.trim());
    }

    return await this.authenticatedRequest(
      `${API_ENDPOINTS.products.byId}/${productId}/reviews`,
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
    return await this.requestWithRetry<ProductReviewsResponse>(
      `${API_ENDPOINTS.products.byId}/${productId}/reviews?page=${page}&size=${size}`
    );
  }

  /**
   * Toggle product in user's wishlist
   * API: POST /api/products/{productId}/wishlist
   */
  static async toggleWishlist(
    productId: number
  ): Promise<WishlistToggleResponse> {
    return await this.authenticatedRequest<WishlistToggleResponse>(
      `${API_ENDPOINTS.products.byId}/${productId}/wishlist`,
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
    return await this.requestWithRetry<ViewRecordResponse>(
      `${API_ENDPOINTS.products.byId}/${productId}/view`,
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

    return await this.requestWithRetry<ProductListResponse>(url);
  }

  /**
   * Get product categories and subcategories
   * API: GET /api/products/categories
   */
  static async getCategories(): Promise<ProductCategoriesResponse> {
    return await this.requestWithRetry<ProductCategoriesResponse>(
      API_ENDPOINTS.products.categories
    );
  }

  /**
   * Get featured products
   * API: GET /api/products/featured
   */
  static async getFeaturedProducts(limit = 10): Promise<ProductListResponse> {
    return await this.requestWithRetry<ProductListResponse>(
      `${API_ENDPOINTS.products.featured}?limit=${limit}`
    );
  }
}

// Export for backward compatibility and convenience
export default ProductService;
