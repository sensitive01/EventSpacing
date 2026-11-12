import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { initCloudinaryFolders, uploadSingleImage } from "../controllers/upload.controller";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      callback(new Error("Only PNG, JPG, JPEG, WebP, and GIF image files are allowed."));
      return;
    }
    callback(null, true);
  },
});

const handleMulterSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      res.status(400).json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "Image file size must be under 10 MB."
            : err.message || "Invalid file upload.",
      });
      return;
    }
    next();
  });
};

const router = Router();

router.post("/", handleMulterSingle, uploadSingleImage);
router.post("/init-folders", initCloudinaryFolders);

export default router;

