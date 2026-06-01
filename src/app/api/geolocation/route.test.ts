
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

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

// Mock fetch
global.fetch = vi.fn();

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

  it('should return country name on success', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ location: { lat: 1, lng: 1 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ types: ['country'], formatted_address: 'Bangladesh' }],
        }),
      });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ location: 'bangladesh' });
  });

  it('should return 500 with generic message on failure', async () => {
    (getAuthenticatedUser as any).mockResolvedValue({ _id: 'user1' });
    (global.fetch as any).mockRejectedValue(new Error('Sensitive Error'));

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.data.error).toBe('Internal Server Error');
    expect(response.data.error).not.toBe('Sensitive Error');
  });
});
