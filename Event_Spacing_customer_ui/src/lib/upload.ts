export type UploadFolder = "venues" | "payment-proofs" | "services" | "general";

export interface UploadedImageResult {
  url: string;
  publicId: string;
  folder: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

const rawUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://eventspacing.onrender.com/api");

const API_BASE_URL = rawUrl.endsWith("/api")
  ? rawUrl
  : `${rawUrl.replace(/\/$/, "")}/api`;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * Formats byte size into a compact human-readable string (e.g., "1.4 MB").
 */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates and uploads an image file to Cloudinary via the backend signed upload API.
 */

export async function uploadImageFile(
  file: File,
  folder: UploadFolder = "general"
): Promise<UploadedImageResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error("Please select a valid image file (PNG, JPG, WebP, or GIF).");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image file size must be under 10 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success || !payload?.data?.url) {
    throw new Error(payload?.message || "Failed to upload image. Please try again.");
  }

  return payload.data as UploadedImageResult;
}
