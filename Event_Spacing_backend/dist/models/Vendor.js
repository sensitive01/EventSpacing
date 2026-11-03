"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VendorSchema = new mongoose_1.Schema({
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    city: { type: String, required: true, default: "Bengaluru" },
    locality: { type: String, required: true, index: true },
    startingPrice: { type: Number, required: true },
    priceUnit: { type: String, default: "per day" },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    portfolioImages: [{ type: String }],
    description: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
}, {
    timestamps: true,
});
VendorSchema.index({ category: 1, city: 1, locality: 1 });
VendorSchema.index({
    businessName: "text",
    category: "text",
    locality: "text",
    description: "text",
});
exports.Vendor = mongoose_1.default.model("Vendor", VendorSchema);
