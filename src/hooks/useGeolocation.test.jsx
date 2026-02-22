import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useGeolocation from "./useGeolocation";
import React from "react";

// Mock fetch
global.fetch = vi.fn();

describe("useGeolocation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return location from ipwho.is (primary)", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, country: "United States" }),
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.location).toBe("united states");
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith("https://ipwho.is/");
  });

  it("should fallback to ipapi.co if primary fails", async () => {
    // Primary fails
    fetch.mockRejectedValueOnce(new Error("Network error"));
    // Fallback succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ country_name: "Canada" }),
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.location).toBe("canada");
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, "https://ipwho.is/");
    expect(fetch).toHaveBeenNthCalledWith(2, "https://ipapi.co/json/");
  });

  it("should handle failure of both providers", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.location).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });
});
