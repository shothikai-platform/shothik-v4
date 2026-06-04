import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GOOGLE_GEOLOCATION_KEY: 'test-key' };
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return generic 500 error and not leak internal messages', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock fetch to throw an error with sensitive info
    (global.fetch as any).mockRejectedValueOnce(new Error('Sensitive database error or API key invalid: sk_test_12345'));

    const response = await POST();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal Server Error');
    expect(data.error).not.toContain('sk_test_12345');
  });

  it('should return location on success when authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

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
            types: ['country'],
            formatted_address: 'Bangladesh',
          },
        ],
      }),
    });

    const response = await POST();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.location).toBe('bangladesh');
  });
});
