import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Upload } from "lucide-react";
import ProductService from "../../services/ProductService";
import type {
  ProductCategoryType,
  ProductCondition,
} from "../../types/products";

interface ProductCreationFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export default function ProductCreationForm({
  onCreated,
  onCancel,
}: ProductCreationFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    category: ProductCategoryType;
    condition: ProductCondition;
  }>({
    name: "",
    description: "",
    price: "",
    category: "GAMING_CONSOLES",
    condition: "NEW",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("product.nameRequired", "Product name is required");
    }
    if (!formData.description.trim()) {
      newErrors.description = t(
        "product.descriptionRequired",
        "Description is required"
      );
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t("product.validPriceRequired", "Valid price required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Step 1: Create the product (without images)
      const productFormData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
      };

      const createdProduct = await ProductService.createProduct(
        productFormData
      );

      // Check if product was created successfully
      if (!createdProduct || !createdProduct.id) {
        throw new Error(
          "Failed to create product: Invalid response from server"
        );
      }

      // Step 2: Upload images if any were selected
      if (images.length > 0 && createdProduct.id) {
        try {
          await ProductService.uploadProductImages(
            createdProduct.id,
            images,
            true // Set first image as main image
          );
        } catch (imageError) {
          console.error("Failed to upload product images:", imageError);
          // Product was created but image upload failed
          setErrors({
            submit: t(
              "product.imageUploadWarning",
              "Product created but image upload failed"
            ),
          });
        }
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "GAMING_CONSOLES",
        condition: "NEW",
      });
      setImages([]);
      setImagePreviews([]);
      setErrors({});

      onCreated?.();
    } catch (error) {
      console.error("Failed to create product:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("product.createError", "Failed to create product");

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    // Reset input to allow selecting same file again
    e.target.value = "";
  };

  const addImages = (files: File[]) => {
    // Validate and filter files
    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        newErrors.images = t(
          "product.invalidFileType",
          "Only image files are allowed"
        );
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.images = t(
          "product.fileTooLarge",
          "Each image must be less than 5MB"
        );
        continue;
      }

      validFiles.push(file);
    }

    // Check total count
    const totalImages = images.length + validFiles.length;
    if (totalImages > MAX_IMAGES) {
      newErrors.images = t(
        "product.tooManyImages",
        `Maximum ${MAX_IMAGES} images allowed`
      );
      const allowedCount = MAX_IMAGES - images.length;
      validFiles.splice(allowedCount);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...errors, ...newErrors });
    }

    if (validFiles.length > 0) {
      // Add new images
      setImages([...images, ...validFiles]);

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      // Clear image errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    // Swap images
    [newImages[fromIndex], newImages[toIndex]] = [
      newImages[toIndex],
      newImages[fromIndex],
    ];
    [newPreviews[fromIndex], newPreviews[toIndex]] = [
      newPreviews[toIndex],
      newPreviews[fromIndex],
    ];

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C2541] rounded-xl border border-slate-600 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {t("product.createProduct", "Create New Product")}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.name", "Product Name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("product.namePlaceholder", "Enter product name")}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.description", "Description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t(
                "product.descriptionPlaceholder",
                "Describe your product"
              )}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.price", "Price")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder={t("product.pricePlaceholder", "0.00")}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && (
              <p className="text-red-400 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.category", "Category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as ProductCategoryType,
                })
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t("product.category", "Category")}
            >
              <option value="GAMING_CONSOLES">{t("categories.gamingConsoles", "Gaming Consoles")}</option>
              <option value="GAMING_ACCESSORIES">{t("categories.gamingAccessories", "Gaming Accessories")}</option>
              <option value="PC_COMPONENTS">{t("categories.pcParts", "PC Components")}</option>
              <option value="GAMING_PERIPHERALS">{t("categories.gamingPeripherals", "Gaming Peripherals")}</option>
              <option value="GAMING_CHAIRS">{t("categories.gamingChairs", "Gaming Chairs")}</option>
              <option value="HEADSETS">{t("categories.headsets", "Headsets")}</option>
              <option value="KEYBOARDS">{t("categories.keyboards", "Keyboards")}</option>
              <option value="MICE">{t("categories.mice", "Mice")}</option>
              <option value="MONITORS">{t("categories.monitors", "Monitors")}</option>
              <option value="GAMES">{t("categories.games", "Games")}</option>
              <option value="COLLECTIBLES">{t("categories.collectibles", "Collectibles")}</option>
              <option value="MERCHANDISE">{t("categories.merchandise", "Merchandise")}</option>
              <option value="OTHER">{t("categories.other", "Other")}</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("product.condition", "Condition")}
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as ProductCondition,
                })
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t("product.condition", "Condition")}
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
              <option value="REFURBISHED">Refurbished</option>
              <option value="FOR_PARTS">For Parts</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("product.images", "Product Images")}
              <span className="text-xs text-gray-400 ml-2">
                ({images.length}/{MAX_IMAGES} -{" "}
                {t(
                  "product.firstImageMain",
                  "First image will be the main image"
                )}
                )
              </span>
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600 hover:border-blue-500 transition-colors"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Main image indicator */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        {t("product.main", "Main")}
                      </div>
                    )}
                    {/* Image number */}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {index + 1}
                    </div>
                    {/* Action buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs"
                          title={t("product.moveLeft", "Move left")}
                        >
                          ←
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded text-white"
                        title={t("product.remove", "Remove")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs"
                          title={t("product.moveRight", "Move right")}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {images.length < MAX_IMAGES && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <div className="text-gray-300 text-sm font-medium">
                    {t(
                      "product.uploadImages",
                      "Click to upload or drag and drop"
                    )}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {t(
                      "product.imageRequirements",
                      "JPG, PNG - Max 5MB each - Up to 5 images"
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Image Error */}
            {errors.images && (
              <p className="text-red-400 text-sm mt-2">{errors.images}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-400 text-sm">{errors.submit}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? t("product.creating", "Creating...")
                : t("product.create", "Create Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
