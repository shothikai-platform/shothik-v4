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
    json: vi.fn((data, options) => ({
      data,
      options,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('POST /api/geolocation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = (await POST()) as any;

    expect(response.status).toBe(401);
    expect(response.data.error).toBe('Unauthorized');
  });

  it('should return 500 if API key is not configured', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    delete process.env.GOOGLE_GEOLOCATION_KEY;

    const response = (await POST()) as any;

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Google Geolocation API key is not configured');
  });

  it('should return 200 and location when successful', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';

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
              formatted_address: 'United States',
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', mockFetch);

    const response = (await POST()) as any;

    expect(response.status).toBe(200);
    expect(response.data.location).toBe('united states');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should return 500 with generic message on fetch error', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const response = (await POST()) as any;

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Internal Server Error');
  });

  it('should return 500 with generic message if country not found', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'test-key';

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ location: { lat: 10, lng: 20 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [], // No results
        }),
      });

    vi.stubGlobal('fetch', mockFetch);

    const response = (await POST()) as any;

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Internal Server Error');
  });
});
