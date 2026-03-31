import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock dependencies
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options, status: options?.status || 200 })),
  },
}));

describe('POST /api/geolocation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';

    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it('should return 200 and location if authenticated and downstream APIs succeed', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });

    // Mock first fetch (Geolocation)
    const mockGeolocationResponse = {
      ok: true,
      json: async () => ({ location: { lat: 10, lng: 20 } }),
    };

    // Mock second fetch (Geocoding)
    const mockGeocodingResponse = {
      ok: true,
      json: async () => ({
        results: [
          {
            types: ['country'],
            formatted_address: 'Test Country',
          },
        ],
      }),
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockGeolocationResponse)
      .mockResolvedValueOnce(mockGeocodingResponse);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ location: 'test country' });
  });
});
