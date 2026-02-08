import axios from "axios";
import AuthService from "../auth.service";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock axios calls
vi.mock("axios");

// Generic types for Axios Response
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}

describe("AuthService Integration Tests", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it("Successful login with valid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { success: true, message: "OK", data: { token: "mock-token" } },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const response = await authService.login("validUser", "validPass", "email");

    // Assert result
    expect(response.data.data.token).toBe("mock-token");
  });

  it("Failed login with invalid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { success: false, message: "Invalid credentials" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {},
    };
    (axios.post as any).mockRejectedValueOnce({ response: mockResponse });

    // Call service function & assert rejection
    await expect(
      authService.login("invalidUser", "invalidPass", "email"),
    ).rejects.toHaveProperty("response.data.message", "Invalid credentials");
  });
});
