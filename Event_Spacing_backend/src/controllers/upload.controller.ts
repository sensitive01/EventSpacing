import { Request, Response, NextFunction } from "express";
import {
  ensureCloudinaryFolder,
  resolveCloudinaryFolder,
  uploadImageBufferToCloudinary,
} from "../config/cloudinary";

/**
 * Uploads a single image file to Cloudinary inside an Event Spacing folder.
 * POST /api/upload
 */
export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({
        success: false,
        message: "No image file provided. Please attach a valid PNG, JPG, or WebP file.",
      });
      return;
    }

    const folderKey = typeof req.body?.folder === "string" ? req.body.folder : "general";
    const folderPath = resolveCloudinaryFolder(folderKey);
    const result = await uploadImageBufferToCloudinary(req.file.buffer, folderPath);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        folder: result.asset_folder || result.folder || folderPath,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pre-creates all standard Event Spacing folders inside Cloudinary Media Library.
 * POST /api/upload/init-folders
 */
export const initCloudinaryFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const keys = ["venues", "payment-proofs", "services", "general"];
    const created: string[] = [];

    for (const key of keys) {
      const folderPath = resolveCloudinaryFolder(key);
      await ensureCloudinaryFolder(folderPath);
      created.push(folderPath);
    }

    res.status(200).json({
      success: true,
      message: "Cloudinary folders initialized successfully.",
      data: { folders: created },
    });
  } catch (error) {
    next(error);
  }
};

