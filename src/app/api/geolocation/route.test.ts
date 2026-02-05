
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      status: options?.status || 200,
      ok: (options?.status || 200) >= 200 && (options?.status || 200) < 300
    })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.GOOGLE_GEOLOCATION_KEY;
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    // This is expected to fail initially because the endpoint returns 500/200/Error currently
    // We expect 401 after the fix.
    expect(response.status).toBe(401);
  });

  it('should return 200 if user is authenticated and API calls succeed', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock Geolocation API response
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ location: { lat: 10, lng: 20 } }),
      })
      // Mock Geocoding API response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              types: ['country'],
              formatted_address: 'Wonderland',
            },
          ],
        }),
      });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ location: 'wonderland' });
  });
});
