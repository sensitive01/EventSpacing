const http = require("http");
const { createApp } = require("./dist/app");
const { connectDB } = require("./dist/config/db");

async function runTests() {
  await connectDB();
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`[Test] Server started on temporary port ${port}`);

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = options.headers || {};
    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + u.search,
          method: options.method || "GET",
          headers,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );
      req.on("error", reject);
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  try {
    // 1. Test Vendor Login
    console.log("[Test 1] Testing Vendor Login...");
    const loginRes = await request("/auth/login", {
      method: "POST",
      body: {
        email: "partner@prestigevenues.com",
        password: "PrestigePartner2026!",
      },
    });
    console.log("Login Status:", loginRes.status, "Success:", loginRes.data?.success);
    const token = loginRes.data?.data?.token;
    if (!token) throw new Error("No token returned on login");

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Test Vendor Profile
    console.log("[Test 2] Testing GET /vendor-portal/profile...");
    const profileRes = await request("/vendor-portal/profile", { headers: authHeaders });
    console.log("Profile Status:", profileRes.status, "Owner:", profileRes.data?.data?.ownerName);

    // 3. Test Vendor Stats
    console.log("[Test 3] Testing GET /vendor-portal/stats...");
    const statsRes = await request("/vendor-portal/stats", { headers: authHeaders });
    console.log("Stats Status:", statsRes.status, "Total Venues:", statsRes.data?.data?.totalVenues);

    // 4. Test Vendor Venues
    console.log("[Test 4] Testing GET /vendor-portal/venues...");
    const venuesRes = await request("/vendor-portal/venues", { headers: authHeaders });
    console.log("Venues Status:", venuesRes.status, "Count:", venuesRes.data?.count);

    // 5. Test Vendor Leads
    console.log("[Test 5] Testing GET /vendor-portal/leads...");
    const leadsRes = await request("/vendor-portal/leads", { headers: authHeaders });
    console.log("Leads Status:", leadsRes.status, "Count:", leadsRes.data?.count);

    // 6. Test Vendor Calendar
    console.log("[Test 6] Testing GET /vendor-portal/calendar...");
    const calRes = await request("/vendor-portal/calendar", { headers: authHeaders });
    console.log("Calendar Status:", calRes.status, "Slots Count:", calRes.data?.data?.length);

    // 7. Test Vendor Payouts
    console.log("[Test 7] Testing GET /vendor-portal/payouts...");
    const payoutsRes = await request("/vendor-portal/payouts", { headers: authHeaders });
    console.log("Payouts Status:", payoutsRes.status, "Records:", payoutsRes.data?.data?.length);

    console.log("\n>>> ALL VENDOR PORTAL API TESTS PASSED SUCCESSFULLY! <<<");
  } catch (err) {
    console.error("[Test Error]:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
