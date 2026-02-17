
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it('should return geolocation data if authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock Google API responses
    mockFetch
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
              formatted_address: 'Bangladesh',
            },
          ],
        }),
      });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ location: 'bangladesh' });
  });
});
