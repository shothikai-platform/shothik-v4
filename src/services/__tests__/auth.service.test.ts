import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import AuthService from '../auth.service';

// Mock axios
vi.mock('axios');

describe('AuthService Integration Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  it('Successful login with valid credentials', async () => {
    const mockResponse = {
      data: { token: 'mock-token', success: true, message: 'Login successful' },
      status: 200,
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.login('validUser', 'validPass', 'email');

    expect(result.data.token).toBe('mock-token');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      { email: 'validUser', password: 'validPass', authtype: 'email' }
    );
  });

  it('Failed login with invalid credentials', async () => {
    const mockError = {
      response: {
        data: { error: 'Invalid credentials' },
        status: 401,
      },
    };
    (axios.post as any).mockRejectedValueOnce(mockError);

    await expect(authService.login('invalidUser', 'invalidPass', 'email')).rejects.toEqual(mockError);
  });

  it('User registration', async () => {
    const mockResponse = {
      data: { message: 'User registered successfully', success: true },
      status: 201,
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.register(
      'newUser',
      'newUser@example.com',
      'newPass',
      'US',
      'email'
    );

    expect(result.data.message).toBe('User registered successfully');
    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        { name: 'newUser', email: 'newUser@example.com', password: 'newPass', country: 'US', auth_type: 'email' }
    );
  });

  it('Google Login', async () => {
    const mockResponse = {
      data: { token: 'google-mock-token', success: true, message: 'Login successful' },
      status: 200,
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.googleLogin('google-auth-code', 'US');

    expect(result.data.token).toBe('google-mock-token');
    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/google-login'),
        { code: 'google-auth-code', country: 'US' }
    );
  });

  it('Forgot password functionality', async () => {
    const mockResponse = {
      data: { message: 'Password reset link sent', success: true },
      status: 200,
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.forgotPassword('user@example.com');

    expect(result.data.message).toBe('Password reset link sent');
    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/forgot-password'),
        { email: 'user@example.com' }
    );
  });

  it('Email verification', async () => {
    const mockResponse = {
      data: { message: 'Email verified successfully', success: true },
      status: 200,
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.verifyEmail('verificationToken');

    expect(result.data.message).toBe('Email verified successfully');
    expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/verify-email/verificationToken')
    );
  });
});
