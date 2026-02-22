import axios from "axios";
import AuthService from "../auth.service";
import { vi, describe, test, expect, beforeEach, afterEach, Mock } from 'vitest';

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
  vi.clearAllMocks();
});

describe("AuthService Integration Tests", () => {
  const authService = new AuthService();

  test("Successful login with valid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { token: "mock-token", success: true, message: "Logged in" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.login("test@example.com", "password123", "email");

    // Assert result
    expect(result.data.token).toBe("mock-token");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), {
      email: "test@example.com",
      password: "password123",
      authtype: "email",
    });
  });

  test("Failed login with invalid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { error: "Invalid credentials", success: false, message: "Failed" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockRejectedValueOnce({ response: mockResponse });

    // Call service function & assert rejection
    await expect(
      authService.login("invalid@example.com", "wrongpass", "email"),
    ).rejects.toHaveProperty("response.data.error", "Invalid credentials");
  });

  test("User registration", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "User registered successfully", success: true },
      status: 201,
      statusText: "Created",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.register(
      "New User",
      "new@example.com",
      "password123",
      "US",
      "email"
    );

    // Assert result
    expect(result.data.message).toBe("User registered successfully");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/register"), {
      name: "New User",
      email: "new@example.com",
      password: "password123",
      country: "US",
      auth_type: "email",
    });
  });

  test("Google Login", async () => {
    const mockResponse: AxiosResponse = {
      data: { token: "google-mock-token", success: true, message: "Google login success" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.googleLogin("google-auth-code", "US");

    // Assert result
    expect(result.data.token).toBe("google-mock-token");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/google-login"), {
      code: "google-auth-code",
      country: "US"
    });
  });

  test("Forgot password functionality", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "Password reset link sent", success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.forgotPassword("user@example.com");

    // Assert result
    expect(result.data.message).toBe("Password reset link sent");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/forgot-password"), {
      email: "user@example.com"
    });
  });

  test("Email verification", async () => {
    // Note: The service implementation for verifyEmail calls axios.post without a body,
    // just the URL with the key.
    const mockResponse: AxiosResponse = {
      data: { message: "Email verified successfully", success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    // The implementation is: verifyEmail(key: string) { return axios.post(`${this.apiUrl}/auth/verify-email/${key}`); }
    // However, the test implementation calls verifyEmail('verificationToken') which should match.
    // Wait, the previous test passed 'verificationToken' as argument.
    // The implementation: verifyEmail(key: string)

    const result = await authService.verifyEmail("verificationToken");

    // Assert result
    expect(result.data.message).toBe("Email verified successfully");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/verify-email/verificationToken"));
  });
});
