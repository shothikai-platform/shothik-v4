
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

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
        json: async () => data
    })),
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getAuthenticatedUser } from '@/lib/server-auth';

describe('POST /api/geolocation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 500 if GOOGLE_GEOLOCATION_KEY is not configured', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    delete process.env.GOOGLE_GEOLOCATION_KEY;

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Internal Server Error' });
  });

  it('should return country on successful geolocation', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'fake-key';

    // Mock geolocation response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ location: { lat: 10, lng: 20 } }),
    });

    // Mock geocoding response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            types: ['country'],
            formatted_address: 'United States',
          },
        ],
      }),
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ location: 'united states' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should return 500 and generic error if geolocation fails', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'fake-key';

    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.data).toEqual({ error: 'Failed to determine location' });
  });
});
