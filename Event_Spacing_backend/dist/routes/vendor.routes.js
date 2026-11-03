"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendor_controller_1 = require("../controllers/vendor.controller");
const router = (0, express_1.Router)();
router.get("/", vendor_controller_1.getVendors);
router.get("/:id", vendor_controller_1.getVendorById);
router.post("/:id/inquire", vendor_controller_1.inquireVendor);
exports.default = router;
