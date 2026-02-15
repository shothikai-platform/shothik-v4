import axios from "axios";
import AuthService from "../auth.service";
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

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

// Setup and teardown
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  // For future cleanup tasks, if needed
});

describe("AuthService Integration Tests with prod-api.shothik.ai", () => {
  test("Successful login with valid credentials", async () => {
    const mockAuthResponse = {
        success: true,
        message: "Login successful",
        data: { token: "mock-token" }
    };

    const mockAxiosResponse = {
      data: mockAuthResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosResponse);

    const authService = new AuthService();
    const result = await authService.login("validUser", "validPass", "password");

    // AuthService returns axios.post result directly
    // So result is mockAxiosResponse
    // result.data is mockAuthResponse
    // result.data.data is { token: "mock-token" }
    // BUT looking at previous test, it seemed to expect result.token directly?
    // No, I think previous test was broken/outdated.
    // Let's assume the standard Axios response structure.

    // Wait, result.data is type AuthResponse.
    // AuthResponse has data?: Record<string, unknown>
    // So result.data.data.token is correct.

    expect((result.data.data as any).token).toBe("mock-token");
  });

  test("Failed login with invalid credentials", async () => {
    const mockErrorResponse = {
        error: "Invalid credentials"
    };

    const mockAxiosErrorResponse = {
      data: mockErrorResponse,
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {},
    };

    const error = {
        response: mockAxiosErrorResponse,
        message: "Request failed with status code 401"
    };

    vi.mocked(axios.post).mockRejectedValueOnce(error);

    const authService = new AuthService();
    await expect(
      authService.login("invalidUser", "invalidPass", "password"),
    ).rejects.toHaveProperty("response.data.error", "Invalid credentials");
  });

  test("User registration", async () => {
    const mockAuthResponse = {
        success: true,
        message: "User registered successfully",
        data: {}
    };

    const mockAxiosResponse = {
      data: mockAuthResponse,
      status: 201,
      statusText: "Created",
      headers: {},
      config: {},
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosResponse);

    const authService = new AuthService();
    const result = await authService.register(
      "newUser",
      "newUser@example.com",
      "newPass",
      "country",
      "password"
    );

    expect(result.data.message).toBe("User registered successfully");
  });

  test("Google Login", async () => {
    const mockAuthResponse = {
        success: true,
        message: "Google login successful",
        data: { token: "google-mock-token" }
    };

    const mockAxiosResponse = {
      data: mockAuthResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosResponse);

    const authService = new AuthService();
    const result = await authService.googleLogin("google-auth-code", "US");

    expect((result.data.data as any).token).toBe("google-mock-token");
  });

  test("Forgot password functionality", async () => {
    const mockAuthResponse = {
        success: true,
        message: "Password reset link sent",
        data: {}
    };

    const mockAxiosResponse = {
      data: mockAuthResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosResponse);

    const authService = new AuthService();
    const result = await authService.forgotPassword("user@example.com");

    expect(result.data.message).toBe("Password reset link sent");
  });

  test("Email verification", async () => {
    const mockAuthResponse = {
        success: true,
        message: "Email verified successfully",
        data: {}
    };

    const mockAxiosResponse = {
      data: mockAuthResponse,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosResponse);

    const authService = new AuthService();
    const result = await authService.verifyEmail("verificationToken");

    expect(result.data.message).toBe("Email verified successfully");
  });
});
