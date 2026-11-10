import { Venue } from "@/types/venue";
import { VendorLead, PayoutRecord, VendorProfile, DateAvailability } from "@/types/vendor";

export const currentVendorProfile: VendorProfile = {
  id: "guest",
  businessName: "",
  ownerName: "Partner",
  email: "",
  phone: "",
  gstNumber: "",
  panNumber: "",
  bankDetails: {
    accountNumber: "",
    ifscCode: "",
    accountHolder: "",
    bankName: "",
  },
  kycStatus: "pending",
  totalVenues: 0,
  rating: 0,
  joinedDate: "Recently",
};

export const vendorVenuesList: (Venue & {
  status: "live" | "under_review" | "draft";
  totalLeads: number;
  monthlyEarnings: number;
})[] = [];

export const vendorLeadsList: VendorLead[] = [];

export const mockCalendarDates: DateAvailability[] = [];

export const mockPayouts: PayoutRecord[] = [];
