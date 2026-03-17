import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
      json: async () => data
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

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it('should return 200 if user is authenticated and API calls succeed', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    // Mock global fetch
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ location: { lat: 10, lng: 20 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              types: ['country'],
              formatted_address: 'Bangladesh'
            }
          ]
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'bangladesh' })
    );
  });
});
