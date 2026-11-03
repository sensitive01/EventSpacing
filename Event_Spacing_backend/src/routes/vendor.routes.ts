import { Router } from "express";
import {
  getVendors,
  getVendorById,
  inquireVendor,
} from "../controllers/vendor.controller";

const router = Router();

router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/:id/inquire", inquireVendor);

export default router;

