import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import AuthService from "../auth.service";

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
      data: { token: "mock-token", success: true, message: "Login successful" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.login("validUser@example.com", "validPass", "email");

    // Assert result
    expect(result.data.token).toBe("mock-token");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), {
        email: "validUser@example.com",
        password: "validPass",
        authtype: "email"
    });
  });

  test("Failed login with invalid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { error: "Invalid credentials" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {},
    };
    (axios.post as any).mockRejectedValueOnce({ response: mockResponse });

    // Call service function & assert rejection
    await expect(
      authService.login("invalidUser", "invalidPass", "email"),
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
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.register(
      "Test User",
      "newUser@example.com",
      "newPass",
      "USA",
      "email"
    );

    // Assert result
    expect(result.data.message).toBe("User registered successfully");
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/register"), {
        name: "Test User",
        email: "newUser@example.com",
        password: "newPass",
        country: "USA",
        auth_type: "email"
    });
  });

  test("Google Login", async () => {
    const mockResponse: AxiosResponse = {
      data: { token: "google-mock-token", success: true, message: "Google login successful" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.googleLogin("google-auth-code", "USA");

    // Assert result
    expect(result.data.token).toBe("google-mock-token");
     expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/google-login"), {
        code: "google-auth-code",
        country: "USA"
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
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.forgotPassword("user@example.com");

    // Assert result
    expect(result.data.message).toBe("Password reset link sent");
  });

  test("Email verification", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "Email verified successfully", success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.verifyEmail("verificationToken");

    // Assert result
    expect(result.data.message).toBe("Email verified successfully");
  });
});
