import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

describe("Geolocation API Route Security & Logic", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("returns 500 when GOOGLE_GEOLOCATION_KEY is not configured", async () => {
    delete process.env.GOOGLE_GEOLOCATION_KEY;

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Google Geolocation API key is not configured");
  });

  it("returns generic 500 error when geolocation downstream service fails, preventing info leakage", async () => {
    process.env.GOOGLE_GEOLOCATION_KEY = "test-key";
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to determine location");
    expect(data.error).not.toContain("Invalid response from geolocation API");
  });

  it("returns generic 500 error when an unexpected exception occurs, without leaking internal details", async () => {
    process.env.GOOGLE_GEOLOCATION_KEY = "test-key";
    (global.fetch as any).mockRejectedValueOnce(new Error("Sensitive internal database connection string"));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to determine location");
    expect(JSON.stringify(data)).not.toContain("Sensitive internal database");
  });

  it("returns lowercased country location on success", async () => {
    process.env.GOOGLE_GEOLOCATION_KEY = "test-key";

    // Mock geolocation response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ location: { lat: 10, lng: 20 } }),
    });

    // Mock geocoding response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            types: ["country"],
            formatted_address: "United States",
          },
        ],
      }),
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.location).toBe("united states");
  });
});
