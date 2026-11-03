import { Router } from "express";
import { getTaxonomies, getLocalities } from "../controllers/category.controller";

const router = Router();

router.get("/", getTaxonomies);
router.get("/localities", getLocalities);

export default router;

