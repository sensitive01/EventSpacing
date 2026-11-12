import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { config } from "./env";

export type UploadFolderKey = "venues" | "payment-proofs" | "services" | "general";

const ALLOWED_FOLDER_KEYS: Record<UploadFolderKey, string> = {
  venues: "venues",
  "payment-proofs": "payment-proofs",
  services: "services",
  general: "general",
};

const ensuredFolders = new Set<string>();

/**
 * Configures and returns the authenticated Cloudinary v2 client.
 */
export function getCloudinaryClient() {
  if (
    !config.cloudinary.cloudName ||
    !config.cloudinary.apiKey ||
    !config.cloudinary.apiSecret
  ) {
    throw new Error(
      "Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend .env."
    );
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Resolves a safe allowlisted Cloudinary folder path under the configured base folder.
 */
export function resolveCloudinaryFolder(folderKey?: string): string {
  const normalized = (folderKey || "general").trim().toLowerCase() as UploadFolderKey;
  const subFolder = ALLOWED_FOLDER_KEYS[normalized] || ALLOWED_FOLDER_KEYS.general;
  const baseFolder = (config.cloudinary.baseFolder || "eventspacing").replace(/^\/+|\/+$/g, "");
  return `${baseFolder}/${subFolder}`;
}

/**
 * Ensures the target folder hierarchy exists in Cloudinary Media Library.
 * Cached per process so repeated uploads avoid extra Admin API calls.
 */
export async function ensureCloudinaryFolder(folderPath: string): Promise<void> {
  if (ensuredFolders.has(folderPath)) return;

  const client = getCloudinaryClient();
  const segments = folderPath.split("/").filter(Boolean);
  let currentPath = "";

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    if (ensuredFolders.has(currentPath)) continue;

    try {
      await client.api.create_folder(currentPath);
    } catch (err: any) {
      // Ignore if folder already exists (HTTP 409) or environment auto-creates on upload
      const status = err?.error?.http_code || err?.http_code;
      if (status !== 409 && !String(err?.message || "").toLowerCase().includes("already exists")) {
        console.warn(`Cloudinary create_folder warning for "${currentPath}":`, err?.message || err);
      }
    }
    ensuredFolders.add(currentPath);
  }
}

function streamUpload(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<UploadApiResponse> {
  const client = getCloudinaryClient();
  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        return reject(error || new Error("Cloudinary returned an empty upload result."));
      }
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

/**
 * Uploads an image buffer directly to Cloudinary inside the specified folder.
 * Supports both Dynamic Folder Mode (asset_folder) and legacy Fixed Folder Mode (folder).
 */
export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  folderPath: string
): Promise<UploadApiResponse> {
  await ensureCloudinaryFolder(folderPath);

  try {
    return await streamUpload(buffer, {
      resource_type: "image",
      asset_folder: folderPath,
      use_asset_folder_as_public_id_prefix: true,
      unique_filename: true,
      overwrite: false,
    });
  } catch (err: any) {
    const msg = String(err?.message || err?.error?.message || "").toLowerCase();
    // Fallback for legacy Fixed Folder Mode accounts that reject asset_folder
    if (msg.includes("asset_folder") || msg.includes("use_asset_folder_as_public_id_prefix")) {
      return streamUpload(buffer, {
        resource_type: "image",
        folder: folderPath,
        unique_filename: true,
        overwrite: false,
      });
    }
    throw err;
  }
}

