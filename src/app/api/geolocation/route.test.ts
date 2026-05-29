import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { getAuthenticatedUser } from '@/lib/server-auth';

// Mock getAuthenticatedUser
vi.mock('@/lib/server-auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock NextResponse.json
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('Geolocation API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as any).mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 if GOOGLE_GEOLOCATION_KEY is not configured', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123' });
    process.env.GOOGLE_GEOLOCATION_KEY = '';

    const response = await POST();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Google Geolocation API key is not configured');
  });

  it('should return location when successful', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'mock-key';

    // Mock fetch for geolocation
    const mockGeolocationResponse = {
      ok: true,
      json: async () => ({ location: { lat: 10, lng: 20 } }),
    };

    // Mock fetch for geocoding
    const mockGeocodingResponse = {
      ok: true,
      json: async () => ({
        results: [
          {
            types: ['country'],
            formatted_address: 'Bangladesh',
          },
        ],
      }),
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce(mockGeolocationResponse)
      .mockResolvedValueOnce(mockGeocodingResponse);

    const response = await POST();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.location).toBe('bangladesh');
  });

  it('should not leak error message when an exception occurs', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ id: 'user-123' });
    process.env.GOOGLE_GEOLOCATION_KEY = 'mock-key';

    global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed'); // Simulating a sensitive error
    });

    const response = await POST();

    expect(response.status).toBe(500);
    const data = await response.json();
    // Should return generic error message instead of leaked detail
    expect(data.error).toBe('Internal Server Error');
  });
});
