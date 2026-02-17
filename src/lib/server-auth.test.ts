import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedUser } from "./server-auth";
import AuthService from "@/services/auth.service";

// Mock AuthService
vi.mock("@/services/auth.service");

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

import { cookies, headers } from "next/headers";

describe("server-auth", () => {
  let mockCookies: any;
  let mockHeaders: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies = {
      get: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookies);

    mockHeaders = {
      get: vi.fn(),
    };
    (headers as any).mockResolvedValue(mockHeaders);
  });

  it("should authenticate via cookie", async () => {
    mockCookies.get.mockReturnValue({ value: "cookie-token" });

    // Mock AuthService.getUser success
    const mockAuthService = {
      getUser: vi.fn().mockResolvedValue({
        data: {
          data: { _id: "user1", name: "User 1" },
        },
      }),
    };
    (AuthService as any).mockImplementation(function () {
      return mockAuthService;
    });

    const user = await getAuthenticatedUser();
    expect(user).toEqual({ _id: "user1", name: "User 1" });
    expect(mockCookies.get).toHaveBeenCalledWith("jwt_token");
    expect(mockAuthService.getUser).toHaveBeenCalledWith("cookie-token");
  });

  it("should authenticate via Authorization header if cookie is missing", async () => {
    mockCookies.get.mockReturnValue(undefined); // No cookie
    mockHeaders.get.mockReturnValue("Bearer header-token");

    const mockAuthService = {
      getUser: vi.fn().mockResolvedValue({
        data: {
          data: { _id: "user1", name: "User 1" },
        },
      }),
    };
    (AuthService as any).mockImplementation(function () {
      return mockAuthService;
    });

    const user = await getAuthenticatedUser();

    // This expects the NEW behavior.
    // Initially, getAuthenticatedUser returns null because it ignores headers.
    expect(user).toEqual({ _id: "user1", name: "User 1" });
    expect(mockAuthService.getUser).toHaveBeenCalledWith("header-token");
  });

  it("should return null if no token provided", async () => {
    mockCookies.get.mockReturnValue(undefined);
    mockHeaders.get.mockReturnValue(null);

    const user = await getAuthenticatedUser();
    expect(user).toBeNull();
  });
});
