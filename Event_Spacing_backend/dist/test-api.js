"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const runTests = async () => {
    await (0, db_1.connectDB)();
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    await new Promise((resolve) => server.listen(5001, () => resolve()));
    const baseUrl = "http://127.0.0.1:5001/api";
    console.log(`\n🧪 Running Backend API Verification against ${baseUrl}...\n`);
    let passed = 0;
    let failed = 0;
    const testEndpoint = async (name, fn) => {
        try {
            await fn();
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
        }
        catch (err) {
            console.error(`  ❌ [FAIL] ${name}:`, err.message || err);
            failed++;
        }
    };
    // 1. Health check
    await testEndpoint("GET /api/health", async () => {
        const res = await fetch(`${baseUrl}/health`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.status !== "ok")
            throw new Error("Expected status: ok");
    });
    // 2. Categories & Taxonomies
    await testEndpoint("GET /api/categories", async () => {
        const res = await fetch(`${baseUrl}/categories`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data.eventCategories || json.data.eventCategories.length === 0) {
            throw new Error("No event categories returned");
        }
    });
    // 3. Venues search & discovery
    let sampleVenueSlug = "";
    await testEndpoint("GET /api/venues (Faceted Discovery)", async () => {
        const res = await fetch(`${baseUrl}/venues?city=Bengaluru&page=1&limit=6`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data || json.data.length === 0)
            throw new Error("No venues found");
        sampleVenueSlug = json.data[0].slug;
    });
    // 4. Featured Venues
    await testEndpoint("GET /api/venues/featured", async () => {
        const res = await fetch(`${baseUrl}/venues/featured`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data || json.data.length === 0)
            throw new Error("No featured venues");
    });
    // 5. Single Venue by Slug
    await testEndpoint(`GET /api/venues/${sampleVenueSlug}`, async () => {
        const res = await fetch(`${baseUrl}/venues/${sampleVenueSlug}`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data || json.data.slug !== sampleVenueSlug)
            throw new Error("Slug mismatch");
    });
    // 6. User Authentication (Login)
    let userToken = "";
    await testEndpoint("POST /api/auth/login", async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "raghav.rao@gmail.com",
                password: "Password@123",
            }),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data.token)
            throw new Error("Token not returned");
        userToken = json.data.token;
    });
    // 7. Protected User Profile (GET /api/auth/me)
    await testEndpoint("GET /api/auth/me (Protected)", async () => {
        const res = await fetch(`${baseUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.data.email !== "raghav.rao@gmail.com")
            throw new Error("User email mismatch");
    });
    // 8. Customer Bookings History (GET /api/bookings/my-bookings)
    await testEndpoint("GET /api/bookings/my-bookings (Protected)", async () => {
        const res = await fetch(`${baseUrl}/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data || json.data.length === 0)
            throw new Error("No bookings found for customer");
    });
    // 9. Concierge Lead Inquiry Submission (POST /api/inquiries/concierge)
    await testEndpoint("POST /api/inquiries/concierge", async () => {
        const res = await fetch(`${baseUrl}/inquiries/concierge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Customer",
                email: "test.customer@gmail.com",
                phone: "9876543210",
                eventType: "Wedding",
                eventDate: "2026-12-25",
                guestCount: 300,
                message: "Need quote for lawn venue with catering.",
            }),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success)
            throw new Error("Inquiry submission failed");
    });
    // 10. Vendor Marketplace (GET /api/vendors)
    await testEndpoint("GET /api/vendors", async () => {
        const res = await fetch(`${baseUrl}/vendors`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.data || json.data.length === 0)
            throw new Error("No vendors found");
    });
    console.log(`\n===============================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`===============================================\n`);
    await new Promise((resolve) => server.close(() => resolve()));
    await mongoose_1.default.connection.close();
    process.exit(failed > 0 ? 1 : 0);
};
runTests();
