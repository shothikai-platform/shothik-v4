import axios from "axios";
import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { AuthService } from "../auth.service";

// Mock axios calls
vi.mock("axios");

// Suite of integration tests for AuthService

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

afterEach(() => {
  // For future cleanup tasks, if needed
});

describe("AuthService Integration Tests", () => {
  const authService = new AuthService();

  test("Successful login with valid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { token: "mock-token" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.login("validUser", "validPass", "manual");

    // Assert result
    expect(result.data.token).toBe("mock-token");
  });

  test("Failed login with invalid credentials", async () => {
    const mockResponse: AxiosResponse = {
      data: { error: "Invalid credentials" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockRejectedValueOnce({ response: mockResponse });

    // Call service function & assert rejection
    await expect(
      authService.login("invalidUser", "invalidPass", "manual"),
    ).rejects.toHaveProperty("response.data.error", "Invalid credentials");
  });

  test("User registration", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "User registered successfully" },
      status: 201,
      statusText: "Created",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.register(
      "newUser",
      "newUser@example.com",
      "newPass",
      "Bangladesh",
      "manual"
    );

    // Assert result
    expect(result.data.message).toBe("User registered successfully");
  });

  test("Google login", async () => {
    const mockResponse: AxiosResponse = {
      data: { token: "google-mock-token" },
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
  });

  test("Forgot password functionality", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "Password reset link sent" },
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
  });

  test("Email verification", async () => {
    const mockResponse: AxiosResponse = {
      data: { message: "Email verified successfully" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    (axios.post as Mock).mockResolvedValueOnce(mockResponse);

    // Call service function
    const result = await authService.verifyEmail("verificationToken");

    // Assert result
    expect(result.data.message).toBe("Email verified successfully");
  });
});
