/**
 * @file Vendor.ts
 * @description Backward-compatible alias for MarketplaceService.
 * Marketplace listings (caterers, photographers, DJs, decorators, etc.) are now canonically
 * stored in the "marketplace_services" collection via the MarketplaceService model.
 */

import {
  MarketplaceService,
  IMarketplaceService,
} from "./MarketplaceService";

export { MarketplaceService, IMarketplaceService };
export const Vendor = MarketplaceService;
export type IVendor = IMarketplaceService;
export default MarketplaceService;
  