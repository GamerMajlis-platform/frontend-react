// Temporary Image Upload Service - Alternative to backend upload
// This can be used while the backend upload issue is being resolved

const IMGBB_API_KEY = "your_imgbb_api_key_here"; // Get free key from imgbb.com
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export class TemporaryImageService {
  /**
   * Upload image to external service (ImgBB) as temporary solution
   */
  static async uploadToExternalService(file: File): Promise<string> {
    try {
      // Validate file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload JPG, PNG, or GIF files only."
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File is too large. Maximum size is 10MB.");
      }

      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      // Upload to ImgBB
      const formData = new FormData();
      formData.append("key", IMGBB_API_KEY);
      formData.append("image", base64.split(",")[1]); // Remove data:image/type;base64, prefix
      formData.append("name", file.name);

      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        return result.data.url;
      }

      throw new Error(
        result.error?.message || "Failed to upload to external service"
      );
    } catch (error) {
      console.error("External upload error:", error);
      throw error;
    }
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Update profile with external image URL (if backend supports this)
   */
  static async updateProfileWithImageUrl(imageUrl: string): Promise<void> {
    // This would need to be implemented if the backend supports
    // updating profile with external URLs via the profile update endpoint
    console.log("Would update profile with URL:", imageUrl);
    // For now, just log the URL that could be manually set
  }
}

// Alternative: Use Cloudinary (if you prefer)
export class CloudinaryService {
  static async uploadToCloudinary(
    file: File,
    cloudName: string,
    uploadPreset: string
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.secure_url) {
      return result.secure_url;
    }

    throw new Error("Failed to upload to Cloudinary");
  }
}
